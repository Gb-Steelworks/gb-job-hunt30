// src/agentCategories.js
// Distinct source categories. Cadence is per-category (see `days`), but all
// run off ONE Vercel cron trigger firing Mon-Fri — the cron handler checks
// each category's `days` against today and skips categories not scheduled.
// This avoids juggling multiple cron entries in vercel.json every time a
// cadence changes; it's one schedule change in this file instead.
// sourceMethod flags which categories should prefer direct fetch over
// web_search where a stable URL/REST pattern exists (no search-tool token
// overhead).

const DAY = { MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6, SUN: 0 };

// Default role keywords — used by any category that doesn't set its own
// `keywords` override. This is the field George asked about: a structured,
// per-category-overridable role filter, separate from the company/agency list.
export const DEFAULT_ROLE_KEYWORDS = [
  "business analyst",
  "agile project manager",
  "program manager",
  "product manager",
  "scrum master",
  "delivery manager",
  "SAP",
  "QA director",
  "test lead",
];

export const AGENT_CATEGORIES = {
  watchlist: {
    label: "Watchlist Companies",
    companies: ["JPMC", "UBS", "Wells Fargo", "Thomson Reuters", "ExxonMobil", "Shell"], // open list — more to come
    keywords: [], // empty = falls back to DEFAULT_ROLE_KEYWORDS; override to narrow
    days: [DAY.MON, DAY.WED, DAY.FRI],
    sourceMethod: "fetch_preferred", // named targets — check for a direct
                                      // pattern (JPMC-Oracle-REST style) before
                                      // falling back to a single NL search per company
    modelTier: "standard",
  },
  staffing: {
    label: "Staffing Firms",
    companies: ["TekSystems", "Kforce", "Judge Group", "Insight Global"], // existing Agent 1 list — confirm/extend
    keywords: [], // falls back to DEFAULT_ROLE_KEYWORDS
    days: [DAY.MON, DAY.TUE, DAY.WED, DAY.THU], // reduced from daily — no Fri/weekend run
    sourceMethod: "search",
    modelTier: "fast_triage_then_standard", // Haiku scan/filter -> Sonnet scoring
                                             // on survivors only; see anthropicClient tier param
  },
  tier1_consulting: {
    label: "Tier 1 Consulting",
    companies: ["Deloitte", "EY", "KPMG", "Accenture", "PwC"],
    keywords: ["agile delivery manager", "SAP", "business analyst", "program manager"], // narrower — consulting-specific
    days: [DAY.MON, DAY.WED, DAY.FRI],
    sourceMethod: "search",
    modelTier: "standard",
  },
  tier2_consulting: {
    label: "Tier 2 Consulting",
    maxCompanies: 10,
    companies: ["Slalom", "Capco", "West Monroe", "Pariveda", "Huron", "Opportune"], // existing — add Guidehouse + others, cap at 10
    keywords: [], // falls back to DEFAULT_ROLE_KEYWORDS
    days: [DAY.MON, DAY.WED, DAY.FRI],
    sourceMethod: "search",
    modelTier: "standard",
  },
  government: {
    label: "Government",
    companies: [
      "US Gov (USAJobs)", // not yet integrated — flagged gap from earlier review
      "State of Texas",
      "State of Georgia", // not yet integrated — flagged gap
      "Harris County",
      "City of Houston",
      "City of Austin", // not yet integrated — flagged gap
    ],
    keywords: ["business analyst", "program manager", "project manager", "IT delivery"], // narrower — matches gov posting language
    days: [DAY.MON, DAY.WED, DAY.FRI],
    sourceMethod: "fetch_preferred", // Harris County / govtjobs-style stable URL patterns
    modelTier: "standard",
  },
};

// Cron trigger: Mon-Fri (union of all category schedules). Individual
// category cadence lives in each category's `days` array above, not here.
export const CRON_TRIGGER_DAYS = "Mon-Fri, 8AM CT";

export function shouldRunToday(categoryKey, date = new Date()) {
  const category = AGENT_CATEGORIES[categoryKey];
  if (!category) throw new Error(`Unknown category: ${categoryKey}`);
  return category.days.includes(date.getDay());
}
