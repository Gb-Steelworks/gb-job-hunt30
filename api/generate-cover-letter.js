// api/generate-cover-letter.js — CommonJS, Vercel serverless.
// POST { phase2Analysis: object, tailoredResumeContent: string }
// Returns the Phase 4 JSON (see phase4CoverLetterPrompt.js for shape).

const { callClaude } = require("../lib/anthropicClient");
const { buildPhase4SystemPrompt } = require("../lib/prompts/phase4CoverLetterPrompt");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST" });
    return;
  }

  try {
    const { phase2Analysis, tailoredResumeContent } = req.body || {};

    if (!phase2Analysis || !tailoredResumeContent) {
      res.status(400).json({
        error: "phase2Analysis and tailoredResumeContent are both required",
      });
      return;
    }

    const userMessage = [
      "PHASE 2 JOB ANALYSIS:",
      JSON.stringify(phase2Analysis, null, 2),
      "",
      "FINAL TAILORED RESUME CONTENT (facts you may draw from):",
      tailoredResumeContent,
      "",
      "Write the cover letter per your instructions. Return the required JSON only.",
    ].join("\n");

    const result = await callClaude({
      systemPrompt: buildPhase4SystemPrompt(),
      userMessage,
      maxTokens: 2048,
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("generate-cover-letter error:", err);
    res.status(500).json({ error: err.message });
  }
};
