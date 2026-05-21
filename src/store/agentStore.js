// src/store/agentStore.js
// Persists agent run history in localStorage so it survives page navigation

const STORAGE_KEY = 'gb_agent_runs'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch { return {} }
}

function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

export function getAgentRun(id) {
  return load()[id] || { lastRun: 'Never', leadsFound: null }
}

export function setAgentRun(id, lastRun, leadsFound) {
  const data = load()
  data[id] = { lastRun, leadsFound }
  save(data)
}
