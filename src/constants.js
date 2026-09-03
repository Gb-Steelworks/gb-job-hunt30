// src/constants.js
// Single source of truth for the Anthropic model strings.
// Update here only when Anthropic deprecates a model.

// Quality tier — Fit/Opportunity scoring, requirement analysis, resume
// tailoring change-plans, cover letters. Anything where judgment quality
// matters more than raw throughput.
export const CLAUDE_MODEL = 'claude-sonnet-5'

// Fast tier — high-volume triage only (daily staffing-firm scan: does this
// posting match role/geography/age at all, before it's worth a full Sonnet
// analysis). Never used for scoring or tailoring quality decisions.
export const CLAUDE_MODEL_FAST = 'claude-haiku-4-5-20251001'

// ---------------------------------------------------------------------------
// SoT Portfolio registry — Resume & Job Pursuit Agent Phase 1 §3 / Phase 3
// tier table. Update whenever a variant is added, retired, or promoted from
// DRAFT to APPROVED. Single source of truth for tier assignment.
export const SOT_PORTFOLIO = {
  primary: {
    tier: "Primary",
    definition: "Enterprise Project / Program Management",
    file: "George_Brooks_Resume_Delivery_Management.docx", // confirmed — rename the
                                                            // uploaded GB_Resume_-_Master.docx to this
    status: "APPROVED",
    summary:
      "Senior Project Manager and Delivery Lead with 15+ years driving enterprise " +
      "software delivery, QA governance, UAT leadership, and modernization across " +
      "financial services, federal government, and cloud programs. Current: Supply " +
      "Bistro (Jan 2025-present), QA Program Delivery Manager — leads Quality " +
      "Engineering and Agile delivery across concurrent product workstreams (test " +
      "planning, functional/regression testing, defect management, release " +
      "readiness), Scrum Master duties, AI-assisted workflow automation. Prior: " +
      "Capco Consulting (Nov 2021-Mar 2024), Agile Delivery Manager/Senior BA — two " +
      "distinct client workstreams: led two 15+-member Agile teams for a medical " +
      "union client (implementation plans, milestones, risk/dependency governance, " +
      "stakeholder communications, requirements translation); separately engineered " +
      "regulatory data remediation controls and governance frameworks for a Tier 1 " +
      "investment bank ($66.1B revenue) engagement, neutralizing $10M+ in potential " +
      "regulatory fines; JPMC " +
      "(Jun 2018-Jul 2019), Agility Lead/Product Manager, Scrum Master/delivery lead " +
      "on a $20M cloud modernization initiative, redesigned release management " +
      "cutting costs $200K+; Makpar/IRS eAuthentication (Jun 2017-Sep 2018), BA/" +
      "Technical Management Lead on a federal platform serving 651M+ annual users; " +
      "Deloitte (Jan 2011-Sep 2014), Senior Integration Consultant/Delivery Manager, " +
      "$50M financial-services transformation across 6 concurrent project streams " +
      "(executive reporting, project tracking, QA/test leadership); also led state " +
      "benefits modernization and eligibility platform work; resolved high-priority, " +
      "politically sensitive issues in a $60M statewide unemployment benefits system " +
      "(90% reduction in claimant resolution time); resolved critical milestone " +
      "conflicts as PMO lead, saving $1M+; earned Deloitte's Extra Effort Award for " +
      "PMO governance. Certifications: CSM, SAFe POPM, SAFe Lean-Agile, PMP (in progress, " +
      "expected October 2026), SAP S/4HANA Business Process Integration Capstone " +
      "(in progress, expected October 2026 — O2C, P2P, MM, FI fundamentals). " +
      "Technical " +
      "strengths: Agile/SAFe delivery, SAP S/4HANA business process integration, " +
      "UAT leadership, requirements analysis, QA governance, release readiness, " +
      "performance testing (LoadRunner, Keynote KITE), AI-" +
      "assisted automation (Claude API, Cursor, Supabase). Education: Rice " +
      "University BSEE, Texas Southern University BS Physics.",
  },
  secondary: {
    tier: "Secondary",
    definition: "Technology Delivery / Transformation",
    file: "George_Brooks_Resume_Consulting.docx",
    status: "MISSING", // file does not exist in public/resumes/ — confirmed via
                        // direct fetch, despite being logged as "built" previously
    summary: null,
  },
  supporting_ba: {
    tier: "Supporting",
    definition: "Business Analysis / Product / Agile",
    file: "George_Brooks_Resume_PM_Product.docx",
    status: "APPROVED",
    summary:
      "Sr. IT Project Manager / Program Manager / Agile Delivery framing — 15+ " +
      "years delivering technology, cloud modernization, systems integration, and " +
      "enterprise transformation across financial services, consulting, " +
      "government, and technology. Current: Supply Bistro (Jan 2025-present, " +
      "titled here as QA Director & Delivery Lead), leading delivery across 3 " +
      "concurrent SaaS workstreams, AI-assisted delivery processes (Claude/" +
      "ChatGPT) cutting manual effort 40%, QA governance reducing defect escape " +
      "20% and delivery risk 25%. Capco Consulting (Nov 2021-Mar 2024), Agile " +
      "Delivery Manager/Senior BA — two distinct client workstreams: (1) two " +
      "cross-functional teams (15+ members) for a medical union client, governing " +
      "implementation plans, milestones, risks, dependencies, and stakeholder " +
      "communications, translating requirements into functional designs and " +
      "process documentation, establishing standardized governance and delivery " +
      "best practices; (2) engineered regulatory data remediation controls and " +
      "governance frameworks for a Tier 1 investment bank ($66.1B revenue) " +
      "engagement, neutralizing $10M+ in potential regulatory fines. Also led " +
      "Capco's PM Thought Leadership Practice. Trilogy Education/" +
      "Rice University (Jun 2021-Mar 2022), PM Instructor, 85% first-attempt cert " +
      "pass rate. JPMC (Jun 2018-Jul 2019), Agility Lead/Product Manager, $20M " +
      "cloud infrastructure modernization, cross-functional Agile teams across " +
      "domestic/international locations, $200K release-cost reduction. G. Brooks " +
      "and Associates (Jan 2015-Jun 2017), freelance tester/PM for small-business " +
      "clients. Makpar/IRS eAuthentication (Jun 2017-Sep 2018), BA/Technical " +
      "Management Lead, federal platform serving 651M+ annual users, 35-40% " +
      "reduction in fraudulent access. Deloitte (Jan 2011-Sep 2014), Senior " +
      "Integration Consultant/Delivery Manager, $50M transformation across 6 " +
      "streams, national lead for Deloitte's PM/Testing Center of Excellence; " +
      "resolved high-priority, politically sensitive issues in a $60M statewide " +
      "unemployment benefits system (90% reduction in claimant resolution time); " +
      "resolved critical milestone conflicts as PMO lead, saving $1M+; earned " +
      "Deloitte's Extra Effort Award for PMO governance. " +
      "Certifications: CSM, SAFe POPM, SAFe Lean-Agile, PMP candidate (exam " +
      "scheduled October 2026). Tools: " +
      "JIRA, Confluence, MS Project, ClickUp, Azure AI, Power BI, Selenium, " +
      "LoadRunner, Keynote KITE, Claude, Gemini.",
  },
  supporting_agile_pm: {
    tier: "Supporting",
    definition: "Agile Project Management / Scrum Master",
    file: "George_Brooks_Resume_ScrumMaster_AgilePM.docx",
    status: "APPROVED",
    summary:
      "Agile Project Manager / Scrum Master — Platform Delivery framing, 12+ " +
      "years (intentional anti-ageism framing on this variant — other SoTs use " +
      "15+) leading technology delivery across financial services, federal " +
      "government, and enterprise modernization. Drives Agile adoption, mentors " +
      "teams through organizational change, administers Jira for backlog " +
      "management/sprint planning/reporting, partners with executive leadership " +
      "on high-visibility platform implementations. Current: Supply Bistro (Jan " +
      "2025-present), QA Program Delivery Manager — Quality Engineering and Agile " +
      "delivery across concurrent product workstreams, Scrum Master " +
      "responsibilities, QA process/standards/governance, AI-assisted workflow " +
      "automation. Capco Consulting (Nov 2021-Mar 2024), Agile Delivery " +
      "Manager/Senior BA — two distinct client workstreams: (1) two Agile teams " +
      "(15+ members) for a medical union client, governing implementation plans, " +
      "milestones, risks, dependencies, stakeholder communications; (2) " +
      "separately, engineered regulatory data remediation controls for a Tier 1 " +
      "investment bank ($66.1B revenue) engagement, neutralizing $10M+ in " +
      "potential regulatory fines; also led Capco's PM Thought Leadership " +
      "Practice. Trilogy Education/Rice University (Jun 2021-Mar 2022), PM " +
      "Instructor, 85% first-attempt cert pass rate. JPMC (Jun 2018-Jul 2019), " +
      "Agility Lead/Product Manager, Scrum Master/delivery lead on $20M cloud " +
      "modernization, Jira/Confluence KPI dashboards, $200K+ cost reduction. " +
      "Makpar/IRS eAuthentication (Jun 2017-Sep 2018), BA/Technical Management " +
      "Lead, federal platform serving 651M+ annual users. Deloitte (Jan 2011-Sep " +
      "2014), Senior Integration Consultant/Delivery Manager, $50M " +
      "transformation across 6 streams, $60M unemployment benefits system (90% " +
      "resolution-time reduction), $1M+ milestone-conflict savings, Extra Effort " +
      "Award. Certifications: CSM, SAFe POPM, SAFe Lean-Agile, PMP (in progress, " +
      "Oct 2026), SAP S/4HANA Capstone (in progress, Oct 2026). Tools: Jira, " +
      "Confluence, Azure DevOps, ClickUp, Selenium, BugBug, LoadRunner, Keynote " +
      "KITE, SQL, Azure, AWS, Claude API, Cursor, Supabase.",
  },
  supporting_qa: {
    tier: "Supporting",
    definition: "QA / Quality Engineering / UAT",
    file: "George_Brooks_QA_Testing_Lead_Resume.docx",
    status: "APPROVED",
    summary:
      "Quality Engineering and QA Testing Lead framing — extensive experience " +
      "leading enterprise software quality, testing, UAT, Agile delivery, and " +
      "technology transformation across financial services, federal government, " +
      "and product environments. Test strategy, functional/regression/" +
      "integration testing, defect management, release readiness, QA " +
      "governance, test automation. NOTE: this SoT is treated as a standalone, " +
      "self-contained account per George's direction — its role/company " +
      "attributions are NOT cross-reconciled with the other approved SoTs and " +
      "should not be blended with them. As written: Supply Bistro (Jan " +
      "2025-present), QA Program Delivery Manager — this variant attributes the " +
      "medical-union client engagement and the $10M+ regulatory remediation work " +
      "to Supply Bistro (differs from other SoTs, where that's Capco). Capco " +
      "Consulting (Nov 2021-Mar 2024), Agile Delivery Manager/Senior BA — medical " +
      "union client, $20M cloud modernization Scrum Master work. Trilogy " +
      "Education/Rice University (Jun 2021-Mar 2022), PM Instructor, 85% " +
      "first-attempt cert pass rate. JP Morgan Chase Bank — this variant merges " +
      "JPMC and Makpar/IRS eAuthentication content under one JPMC heading " +
      "(federal platform serving 651M+ annual users, defect tracking for a " +
      "20-member dev team, Jira/Confluence dashboards, $200K+ cost reduction); " +
      "no separate Makpar entry in this document. Deloitte (Jan 2011-Sep 2014), " +
      "Senior Integration Consultant/Delivery Manager — shorter bullet set than " +
      "other SoTs (no unemployment-benefits/$1M/Extra Effort Award content " +
      "here). Certifications: PMP, CSM, SAFe POPM, SAFe Lean-Agile, SAP S/4HANA " +
      "Capstone (both in progress, expected October 2026). Tools: Selenium, " +
      "BugBug, IBM CLM, Test Automation, Jira, Confluence, Azure DevOps, " +
      "ClickUp, SQL, Azure, AWS, GitHub, Vercel, Claude API, Cursor, Supabase.",
  },
  industry_fsi: {
    tier: "Industry",
    definition: "Financial Services",
    file: "George_Brooks_Resume_FSI.docx",
    status: "MISSING", // same — does not exist in the repo
    summary: null,
  },
  industry_energy: {
    tier: "Industry",
    definition: "Energy",
    file: null,
    status: "GAP", // no SoT built yet — engine must surface this rather than
                   // silently falling back to another tier without saying so
    summary: null,
  },
}

// Posting recency — two separate mechanisms:
//   LEAD_MAX_AGE_DAYS — hard admission cutoff. Older than this, reject
//                        outright, never scored, never shown.
//   PRIORITY_AGE_DAYS — at/under this age gets an Opportunity Score upgrade
//                        AND priority:true for the dashboard.
export const LEAD_MAX_AGE_DAYS = 90
export const PRIORITY_AGE_DAYS = 21

export const RECENCY_BANDS = [
  { maxDays: 20, effect: "priority_upgrade" },
  { maxDays: 30, effect: "slight_downgrade" },
  { maxDays: 45, effect: "downgrade" },
  { maxDays: 90, effect: "significant_downgrade" },
  { maxDays: Infinity, effect: "reject" }, // never reached — LEAD_MAX_AGE_DAYS filters first
]

// Fit Score rubric weights — Phase 2 §14. Sum must equal 1.0; adjust only
// per-job with an explicit logged reason, never silently.
export const FIT_SCORE_WEIGHTS = {
  role_function_match: 0.25,
  experience_responsibility_match: 0.25,
  required_quals_certs: 0.15,
  technology_platform_match: 0.10,
  industry_domain_match: 0.10,
  methodology_process_match: 0.05,
  leadership_stakeholder_match: 0.10,
}

export const PURSUIT_RECOMMENDATIONS = ["A", "B", "C", "D", "E"]
