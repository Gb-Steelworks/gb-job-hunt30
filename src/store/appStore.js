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
}
