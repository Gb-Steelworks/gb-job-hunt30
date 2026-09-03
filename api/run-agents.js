// api/run-agents.js — CommonJS, Vercel serverless.
// REPLACES the currently-deployed version, which asked Claude to "generate
// realistic" leads with no web_search tool attached — i.e., fabricated data
// on a schedule. This version always uses live web_search (or a direct-fetch
// adapter where one exists) and never asks the model to invent a posting.
//
// Triggers:
//   - Cron (Mon-Fri 8AM CT, per vercel.json): runs whichever categories are
//     scheduled today per src/agentCategories.js `days`.
//   - Manual: GET /api/run-agents?categories=staffing,watchlist&force=true
//     `categories` = comma-separated category keys, omit to consider all.
//     `force=true` = ignore each category's `days` schedule and run anyway.

const { AGENT_CATEGORIES, DEFAULT_ROLE_KEYWORDS, shouldRunToday } = require("../src/agentCategories");
const { CLAUDE_MODEL, CLAUDE_MODEL_FAST } = require("../src/constants");

const ZERO_HALLUCINATION_CLAUSE = `
Report ONLY real, currently open postings you actually find via search. Never invent,
guess, or extrapolate a listing. If you find no genuine matches, return an empty array —
an empty result is correct and expected sometimes; a fabricated one is not.`;

function buildSystemPrompt(company, keyword) {
  return `You are a job search agent searching for real, currently open postings.
Company/agency: ${company}
Role focus: ${keyword}
Target geography: Houston TX, Dallas TX, Austin TX, Remote (others may be added later).
${ZERO_HALLUCINATION_CLAUSE}
Return ONLY a valid JSON array. Each object: { "role_title": string, "company": string,
"location": string, "work_model": "Remote"|"Hybrid"|"On-site", "employment_type":
"Contract"|"Full-Time"|"Contract-to-Hire", "posting_date": string|null, "apply_link":
string, "source": string, "description": string, "contact_name": string|null, "contact_email": string|null }.
"description" should be a 3-5 sentence summary of the role's actual requirements and
responsibilities as found — this feeds the Fit/Opportunity scoring engine, so pull real
detail from the posting, don't just restate the title.
Per the CONTACT_RULE: leave contact fields null unless a name/email is directly present in
what you found — never invent one.`;
}

async function callClaudeForLeads({ apiKey, model, system, userMessage, useWebSearch, maxTokens = 3000 }) {
  const tools = [];
  if (useWebSearch) tools.push({ type: "web_search_20250305", name: "web_search" });

  const body = { model, max_tokens: maxTokens, system, messages: [{ role: "user", content: userMessage }] };
  if (tools.length) body.tools = tools;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      ...(useWebSearch ? { "anthropic-beta": "web-search-2025-03-05" } : {}), // only when search tools present — see Issue 1/8 in scraping doc
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "API error");

  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("[");
  const end = clean.lastIndexOf("]");
  if (start === -1 || end === -1) return [];
  try {
    return JSON.parse(clean.slice(start, end + 1));
  } catch {
    return [];
  }
}

function makeLeadId(company, roleTitle) {
  const slug = (s) => (s || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${slug(company)}_${slug(roleTitle)}`;
}

async function runCategory(categoryKey, apiKey) {
  const category = AGENT_CATEGORIES[categoryKey];
  const keywords = category.keywords && category.keywords.length ? category.keywords : DEFAULT_ROLE_KEYWORDS;
  const useWebSearch = true; // always live — this is the fix. `fetch_preferred`
                              // categories should eventually use a direct-fetch
                              // adapter per site (JPMC Oracle REST style) instead
                              // of search at all; those adapters are a per-site
                              // TODO, not yet wired here — falls back to search
                              // in the meantime, which is still live/real, just
                              // not the cheapest path for those sites yet.
  const model = category.modelTier === "fast_triage_then_standard" ? CLAUDE_MODEL_FAST : CLAUDE_MODEL;

  const leads = [];
  for (const company of category.companies) {
    for (const keyword of keywords) {
      try {
        const found = await callClaudeForLeads({
          apiKey,
          model,
          system: buildSystemPrompt(company, keyword),
          userMessage: `Search for open ${keyword} roles at ${company}.`,
          useWebSearch,
        });
        leads.push(
          ...found.map((l) => ({
            ...l,
            id: makeLeadId(l.company, l.role_title), // required for appStore.mergeAgentLeads dedup
            category: categoryKey,
            matched_keyword: keyword,
          }))
        );
      } catch (err) {
        console.error(`[run-agents] ${categoryKey}/${company}/"${keyword}" failed: ${err.message}`);
        // one failed company/keyword pair doesn't abort the whole category run
      }
    }
  }
  return leads;
}

module.exports = async function handler(req, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "No API key" });

  const requestedCategories = req.query && req.query.categories ? req.query.categories.split(",") : null;
  const force = req.query && req.query.force === "true";
  const today = new Date();

  const categoriesToRun = Object.keys(AGENT_CATEGORIES).filter((key) => {
    if (requestedCategories) return requestedCategories.includes(key);
    return force || shouldRunToday(key, today);
  });

  if (categoriesToRun.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No categories scheduled today. Use ?categories=x,y or ?force=true to run manually.",
      timestamp: today.toISOString(),
    });
  }

  try {
    const results = {};
    for (const key of categoriesToRun) {
      results[key] = await runCategory(key, apiKey);
    }
    const allLeads = Object.values(results).flat();

    return res.status(200).json({
      success: true,
      timestamp: today.toISOString(),
      triggered_by: requestedCategories ? "manual" : force ? "manual_force" : "cron",
      categories_run: categoriesToRun,
      leads_found: allLeads.length,
      by_category: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, v.length])),
      leads: allLeads,
    });
  } catch (err) {
    console.error("[run-agents] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
