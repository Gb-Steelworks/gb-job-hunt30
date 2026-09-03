// api/analyze-job.js — CommonJS, Vercel serverless.
// POST { jobPostingText: string, sotSummaries: [{key, tier, definition, summary}] }
// Returns the Phase 1/2 JSON analysis (see phase1_2Prompt.js for shape).
//
// EFFICIENCY NOTE: sotSummaries must be short (~150-300 word) summaries per
// SoT, not full resume text — sending all 6 full resumes on every job call
// was unnecessary input-token cost. Full text is only needed for the ONE
// selected SoT, pulled separately by tailor-resume.js in Phase 3. Generate
// each summary once (from the SoT's actual content) and store it alongside
// the SOT_PORTFOLIO entry in constants.js — don't regenerate it per call.

const { callClaude } = require("../lib/anthropicClient");
const { buildPhase1_2SystemPrompt } = require("../lib/prompts/phase1_2Prompt");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST" });
    return;
  }

  try {
    const { jobPostingText, sotSummaries } = req.body || {};

    if (!jobPostingText || typeof jobPostingText !== "string") {
      res.status(400).json({ error: "jobPostingText (string) is required" });
      return;
    }
    if (!Array.isArray(sotSummaries) || sotSummaries.length === 0) {
      res.status(400).json({
        error:
          "sotSummaries (array of short APPROVED SoT summaries — NOT full resume " +
          "text, see note below) is required — never let the engine guess which " +
          "SoTs exist.",
      });
      return;
    }

    const userMessage = [
      "JOB POSTING:",
      jobPostingText,
      "",
      "AVAILABLE APPROVED SOURCE-OF-TRUTH RESUMES (summaries only — full text is",
      "pulled separately in Phase 3 for whichever one you select here):",
      JSON.stringify(sotSummaries, null, 2),
      "",
      "Analyze this job per your instructions. Select the strongest APPROVED SoT, ",
      "extract requirements into the four categories, score Fit and Opportunity ",
      "separately, and return the required JSON structure only.",
    ].join("\n");

    const result = await callClaude({
      systemPrompt: buildPhase1_2SystemPrompt(),
      userMessage,
      maxTokens: 4096,
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("analyze-job error:", err);
    res.status(500).json({ error: err.message });
  }
};
