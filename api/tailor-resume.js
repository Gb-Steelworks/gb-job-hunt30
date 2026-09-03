// api/tailor-resume.js — CommonJS, Vercel serverless.
// POST { sotKey: string, phase2Analysis: object }
// Returns the Phase 3 change-plan JSON (see phase3TailorPrompt.js for shape).
//
// UPDATED per Option 2 (synchronous adm-zip path, same technique as
// api/optimize-resume.js — see README "Apply — needs a decision" note for
// why the original LibreOffice/Claude-session design was replaced):
//
// This endpoint now fetches the SoT's actual .docx from GitHub and extracts
// its plain text itself (via adm-zip, same library optimize-resume.js
// already uses) instead of requiring the frontend to supply sotFullText.
// It still produces a change plan only — it does not touch the docx. The
// frontend takes this change plan's `changes[].proposed_text` lines, joins
// them, and calls /api/optimize-resume with that as `bullets` to get the
// actual downloadable file, synchronously, no LibreOffice/Claude-session
// step required.
//
// The GitHub queue write is kept as an audit trail / optional path to the
// fuller RUNBOOK.md flow (redlined draft, dual ATS+print output, cover
// letter) for anyone who wants that heavier treatment on a specific
// high-priority role — but it's no longer required for the everyday Apply
// flow described above.

const AdmZip = require("adm-zip");
const { callClaude } = require("../lib/anthropicClient");
const { buildPhase3SystemPrompt } = require("../lib/prompts/phase3TailorPrompt");
const { enqueuePendingTailoring } = require("../lib/githubQueue");
const { SOT_PORTFOLIO } = require("../src/constants");

function makeJobId(company, role) {
  const slug = (s) => (s || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${slug(company)}_${slug(role)}_${date}`;
}

// Strip word/document.xml down to plain text. Not a full docx-to-text
// converter (doesn't handle tables specially, etc.) — good enough for
// feeding the model source content, which is all this is used for.
function extractPlainText(docxBuffer) {
  const zip = new AdmZip(docxBuffer);
  const xml = zip.readAsText("word/document.xml");
  const withBreaks = xml.replace(/<\/w:p>/g, "\n");
  const noTags = withBreaks.replace(/<[^>]+>/g, "");
  return noTags
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST" });
    return;
  }

  try {
    const { sotKey, phase2Analysis } = req.body || {};

    if (!sotKey) {
      res.status(400).json({ error: "sotKey is required" });
      return;
    }
    const sotEntry = SOT_PORTFOLIO[sotKey];
    if (!sotEntry || sotEntry.status !== "APPROVED" || !sotEntry.file) {
      res.status(400).json({
        error: `sotKey "${sotKey}" is not an APPROVED SoT with a file on record. ` +
               `Only APPROVED SoTs can be used as source material.`,
      });
      return;
    }
    if (!phase2Analysis || !phase2Analysis.fit_analysis) {
      res.status(400).json({
        error:
          "phase2Analysis (the full analyze-job output) is required — the change " +
          "plan must cite Phase 2 evidence, it can't be generated standalone.",
      });
      return;
    }

    const owner = process.env.GITHUB_OWNER || "Gb-Steelworks";
    const repo = process.env.GITHUB_REPO || "gb-job-hunt30";
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/public/resumes/${sotEntry.file}`;
    const fileRes = await fetch(rawUrl);
    if (!fileRes.ok) {
      res.status(404).json({
        error: `Source resume not found at public/resumes/${sotEntry.file} — check it's actually pushed.`,
      });
      return;
    }
    const sotFullText = extractPlainText(Buffer.from(await fileRes.arrayBuffer()));

    const userMessage = [
      `SOT KEY: ${sotKey}`,
      "SOT FULL TEXT:",
      sotFullText,
      "",
      "PHASE 2 JOB ANALYSIS:",
      JSON.stringify(phase2Analysis, null, 2),
      "",
      "Produce the change plan per your instructions. Every change must cite a ",
      "requirement_match from the Phase 2 analysis above.",
    ].join("\n");

    const result = await callClaude({
      systemPrompt: buildPhase3SystemPrompt(),
      userMessage,
      maxTokens: 4096,
    });

    const jobId = makeJobId(result.job_company, result.job_role);
    enqueuePendingTailoring(jobId, {
      change_plan: result,
      phase2_analysis: phase2Analysis,
      sot_key: sotKey,
      queued_at: new Date().toISOString(),
    }).catch((err) => console.error("tailor-resume: queue write failed (non-fatal):", err.message));

    res.status(200).json({
      ...result,
      job_id: jobId,
      sot_file: sotEntry.file,
    });
  } catch (err) {
    console.error("tailor-resume error:", err);
    res.status(500).json({ error: err.message });
  }
};
