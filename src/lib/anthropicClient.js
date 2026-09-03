// lib/anthropicClient.js — CommonJS. Shared caller for all Phase 1-4 endpoints.
// Mirrors api/claude.js conventions: unprefixed process.env key, CommonJS only.

const { CLAUDE_MODEL, CLAUDE_MODEL_FAST } = require("../src/constants");

async function callClaude({ systemPrompt, userMessage, maxTokens = 4096, tier = "standard" }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY missing or empty in the serverless environment. " +
      "Check Vercel project settings — see GB_Scraping_Issues_Summary.md Issue #7."
    );
  }

  // tier: "fast" -> Haiku 4.5, for high-volume triage (daily staffing scan).
  //       "standard" -> the main CLAUDE_MODEL, for Fit/Opportunity scoring,
  //       tailoring change-plans, and cover letters — anything the score or
  //       final document quality actually depends on.
  const model = tier === "fast" ? CLAUDE_MODEL_FAST : CLAUDE_MODEL;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      // Prompt caching: these system prompts are static and reused on every
      // call. Marking the block cacheable means repeat calls within the
      // cache TTL pay the much cheaper cache-read rate instead of full input
      // price for the same ~800-1500 tokens every time.
      system: [
        { type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const textBlock = (data.content || []).find((b) => b.type === "text");
  if (!textBlock) {
    throw new Error("No text content block in Claude response.");
  }

  // Strip markdown fences if the model wrapped the JSON.
  const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `Failed to parse Claude response as JSON: ${err.message}\nRaw: ${cleaned.slice(0, 500)}`
    );
  }
}

module.exports = { callClaude };
