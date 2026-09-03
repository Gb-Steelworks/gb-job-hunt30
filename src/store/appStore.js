// src/store/appStore.js
// Central localStorage persistence — survives refresh, navigation, redeployment

const KEYS = {
  LEAD_STATUSES:   'gb_lead_statuses',
  APPLICATIONS:    'gb_applications',
  PRIORITY_CHECKS: 'gb_priority_checks',
  AGENT_LEADS:     'gb_agent_leads',
}

function load(key, fallback) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback }
  catch { return fallback }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

// Lead statuses
export function loadLeadStatuses()         { return load(KEYS.LEAD_STATUSES, {}) }
export function saveLeadStatus(id, status) {
  const d = load(KEYS.LEAD_STATUSES, {}); d[id] = status; save(KEYS.LEAD_STATUSES, d)
}

// Applications
export function loadApplications()     { return load(KEYS.APPLICATIONS, []) }
export function saveApplications(apps) { save(KEYS.APPLICATIONS, apps) }
export function upsertApplication(app) {
  const apps = load(KEYS.APPLICATIONS, [])
  const i = apps.findIndex(a => a.id === app.id)
  if (i >= 0) apps[i] = { ...apps[i], ...app }
  else apps.push(app)
  save(KEYS.APPLICATIONS, apps)
  return apps
}

// Priority action checkboxes
export function loadPriorityChecks()       { return load(KEYS.PRIORITY_CHECKS, {}) }
export function savePriorityChecks(checks) { save(KEYS.PRIORITY_CHECKS, checks) }

// Agent-found leads
export function loadAgentLeads()         { return load(KEYS.AGENT_LEADS, []) }
export function saveAgentLeads(leads)    { save(KEYS.AGENT_LEADS, leads) }
export function mergeAgentLeads(newLeads) {
  const existing = load(KEYS.AGENT_LEADS, [])
  const ids = new Set(existing.map(l => l.id))
  const merged = [...existing, ...newLeads.filter(l => !ids.has(l.id))]
  save(KEYS.AGENT_LEADS, merged)
  return merged

// Attach Phase 1/2 scoring output (from api/analyze-job.js) onto an existing
// agent-found lead, by id. Flattens the fields DashboardPage.jsx's patch
// looks for (fit_score, opportunity_score, priority, recommendation_grade)
// directly onto the lead object rather than nesting the full analysis JSON,
// so the dashboard patch can read them with no further transformation.
export function updateLeadScore(id, phase2Result) {
  const leads = load(KEYS.AGENT_LEADS, [])
  const i = leads.findIndex(l => l.id === id)
  if (i === -1) return leads // lead not found — caller should check the length
                              // didn't change if this matters to them

  leads[i] = {
    ...leads[i],
    fit_score: phase2Result.fit_analysis?.fit_score ?? null,
    opportunity_score: phase2Result.opportunity_analysis?.opportunity_score ?? null,
    priority: phase2Result.opportunity_analysis?.priority ?? false,
    recommendation_grade: phase2Result.recommendation?.grade ?? null,
    recommendation_rationale: phase2Result.recommendation?.rationale ?? null,
    sot_recommendation: phase2Result.sot_recommendation ?? null,
    phase2_analysis_full: phase2Result, // Apply (Phase 3) needs the whole thing to cite evidence
    scored_at: new Date().toISOString(),
  }
  save(KEYS.AGENT_LEADS, leads)
  return leads
}  
}
