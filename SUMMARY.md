# George Brooks — Job Hunt System
## Master Summary & Modification Reference
**Last updated:** May 4, 2026  
**Status:** Web app built · Make.com config ready · 8 live leads found · Kforce contact identified

---

## What This System Is

An autonomous job hunt system built in Claude consisting of:
- A **React web app** (deployable to Vercel) — your persistent dashboard
- **3 AI agents** running on Claude's API via Make.com on a 48-hour schedule
- A **Supabase database** storing leads, applications, companies, and run logs
- A **Google Sheets** backup tracker (optional, synced by Make.com)
- An **email trigger** for on-demand application prep (Agent 3)

---

## Deployed App Structure

```
job-hunt-webapp/
├── src/
│   ├── App.jsx                  ← Sidebar nav + page routing
│   ├── index.css                ← Design system (dark theme, DM Mono + Sora fonts)
│   ├── main.jsx                 ← React entry point
│   ├── lib/
│   │   └── supabase.js          ← Supabase client + SQL schema comments
│   └── pages/
│       ├── DashboardPage.jsx    ← Stats, top leads, priority actions, run log
│       ├── LeadsPage.jsx        ← Smart spreadsheet (sort, filter, status, score bar)
│       ├── ApplicationsPage.jsx ← Application tracker with full status lifecycle
│       ├── CompaniesPage.jsx    ← Add companies → immediate role search + verify
│       ├── LinkedInPage.jsx     ← Recruiters, hiring managers, 2nd-degree contacts
│       └── AgentsPage.jsx       ← Agent controls + scheduling options
├── index.html
├── vite.config.js
├── vercel.json
├── .env.example
└── package.json
```

---

## The Three Agents

### Agent 1 — Job Scout
- **What it does:** Searches job boards (Indeed, Dice, LinkedIn, Glassdoor, TEKsystems, Judge Group) for your 4 target role types
- **Target roles:** QA/Manual Testing, Business Analyst, Agile Project Manager/Scrum Master, Product Manager
- **Target geography:** Texas (Houston, Dallas, Austin) + Remote
- **Output:** Structured JSON → rows in Supabase `leads` table + email digest
- **Cadence:** Every 48 hours via Make.com, or on-demand from Claude
- **Prompt file:** `agent-prompts/agent1_job_scout.txt`

### Agent 2 — FSI & Boutique Spotter
- **What it does:** Searches specific employer career pages directly (not job boards)
- **Target employers:** JPMC, Wells Fargo, USAA, Charles Schwab, Fidelity, Frost Bank, Slalom, West Monroe, Pariveda, Opportune, ISG
- **Output:** Same structure as Agent 1, logged to `leads` table with `agent_source = 'Agent 2'`
- **Cadence:** Every 48 hours (runs same Make.com scenario as Agent 1)
- **Prompt file:** `agent-prompts/agent2_fsi_spotter.txt`

### Agent 3 — Application Prep
- **What it does:** Given a job description, produces: (1) ATS-optimized resume, (2) tailored cover letter, (3) recruiter/HM Q&A prep
- **Trigger:** Send yourself an email with subject `APPLY: [Role Title] at [Company]` — paste JD in body
- **Output:** Full package emailed back in ~60 seconds; application logged to Supabase
- **Cadence:** Per-role, not scheduled
- **Prompt file:** `agent-prompts/agent3_app_prep.txt`

---

## Current Leads (as of May 3, 2026)

| Role | Company | Match | Type | Location | Status |
|---|---|---|---|---|---|
| IT QA Specialist IV | Enbridge / Raise Recruiting | 95% | Contract | Hybrid · Spring TX | New |
| Business Analyst III | TEKsystems | 92% | Contract | Hybrid · Houston | New |
| Sr. BA — Customer Comms | TEKsystems (FSI) | 91% | Contract | Remote | New |
| Senior QA Analyst | Tekmetric | 90% | Full-Time | Hybrid · Houston | New |
| Appian Software QA Tester | KBR | 88% | Full-Time | On-site · Houston | New |
| Sr. Agile Scrum Master | CrowdPlat | 85% | Contract | Remote | New |
| QA Analyst / BA | Grenza Inc. | 80% | Contract | On-site · Houston | New |
| QA Testing Analyst | ESP Enterprises | 78% | Contract | On-site · Houston | New |

---

## Kforce / Cole Withers Status

- **Cole Withers** — Senior Talent Executive, Kforce (San Marcos TX, covers Houston)
- Reached out about 3 manual testing roles in Spring TX (likely HPE campus)
- **Verified active:** Manual QA Tester (Hybrid), Business Analyst / Product Owner, Data Project Manager
- **Likely filled / stale:** SAP Manual Application Tester (Dice 410 error — posting removed)
- **Backup contact found:** Staci Wells — Senior Talent Executive, Kforce · `swells@kforce.com`
  - She self-identifies as "HP nerd" — works the HPE Spring TX account directly
  - LinkedIn: `linkedin.com/in/staci-wells-48297b7b`

---

## Target Companies (pre-loaded)

| Company | Industry | Priority | Contact |
|---|---|---|---|
| Kforce | Staffing | High | Cole Withers + Staci Wells |
| JP Morgan Chase | FSI / Banking | High | — (former employer) |
| Wells Fargo | FSI / Banking | High | — (former client 2016-18) |
| USAA | FSI / Banking | Medium | — |
| Slalom Consulting | Consulting | High | — |
| Charles Schwab | FSI / Banking | Medium | — (Westlake TX) |
| Fidelity Investments | FSI / Banking | Medium | — (Westlake TX) |
| Frost Bank | FSI / Banking | Medium | — |

---

## Setup Steps (not yet done)

1. **Anthropic API key** → console.anthropic.com → Settings → API Keys
2. **Supabase project** → app.supabase.com → new project → run SQL schema from `supabase.js`
3. **Vercel deploy** → vercel.com → import GitHub repo → set env vars → deploy
4. **Make.com scenarios** → build from `make_scenario_agents_1_2.json` + `make_scenario_agent3_email_trigger.json`
5. **Google Sheets tracker** → create from `sheets_setup_guide.txt` (optional, parallel to Supabase)

---

## Files in the Download Package

```
job_hunt_system.zip
├── job-hunt-webapp/           ← Full React web app (deploy to Vercel)
├── agent-prompts/
│   ├── agent1_job_scout.txt
│   ├── agent2_fsi_spotter.txt
│   └── agent3_app_prep.txt
├── make-scenarios/
│   ├── make_scenario_agents_1_2.json
│   └── make_scenario_agent3_email_trigger.json
├── google-sheets/
│   └── sheets_setup_guide.txt
└── docs/
    └── SETUP_GUIDE.txt
```

---

## Candidate Profile (baked into all agent prompts)

- **Name:** George Brooks, POPM, CSM
- **Location:** Houston, TX
- **Experience:** 20+ years · Financial services, federal government, enterprise tech
- **Key roles:** QA Director (Supply Bistro) · Agile Delivery Manager / Sr. BA (Capco) · Product Owner (JPMC) · BA Lead (Makpar/IRS) · Delivery Manager (Deloitte)
- **Certifications:** CSM · SAFe POPM · SAFe Lean Agile · Azure · PMP (exp. May 2026) · AWS AI (exp. July 2026)
- **Education:** Rice University BSEE · Texas Southern University B.S. Physics · EMBA (in progress)
- **Target roles:** Manual QA/Test Lead · Sr. Business Analyst · Agile PM/Scrum Master · Product Manager/Owner
- **Open to:** Contract · Contract-to-hire · Full-time
- **Geography:** Houston TX · Texas-wide · Remote

---

## Planned Modifications / Known Gaps

Use this section to track changes for future threads:

- [ ] Connect web app to live Supabase (currently using seeded in-memory data)
- [ ] Wire "Run agent ↗" buttons to actual Claude API calls from within the app
- [ ] Add resume file upload to agent prep flow
- [ ] Add "Prep docs" modal that shows resume/cover letter/Q&A inline in the app
- [ ] Add email notification integration (SendGrid or Gmail SMTP)
- [ ] Add mobile nav (sidebar hidden on mobile currently)
- [ ] Persist status changes to Supabase (currently in React state only)
- [ ] Add export to PDF / CSV from leads table
- [ ] Add notes field to each lead card (expandable row)

---

## How to Start a New Thread for Modifications

Paste this into a new Claude conversation:

> "I have a job hunt web app and agent system built in a previous Claude thread. Here is the master summary: [paste this doc]. I want to modify [describe what you want to change]."

All context needed to continue the build is in this document.

---

## Contact to Action Right Now (May 3, 2026)

**Priority 1:** Email or LinkedIn message Staci Wells at Kforce (`swells@kforce.com`) — reference Cole Withers, express interest in active manual QA and BA roles, ask for confirmed active req numbers.

**Priority 2:** Apply to Enbridge IT QA Specialist IV via Raise Recruiting (`hello@raiserecruiting.com`) — 95% match, active posting, 48h review SLA.

**Priority 3:** Email Kape Kelly at TEKsystems (`PatrKelly@teksystems.com`) — two active Houston BA roles, she already has your profile.

---

*Generated by Claude · George Brooks Job Hunt System · May 2026*
