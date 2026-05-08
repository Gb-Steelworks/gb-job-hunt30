// src/store/useAppStore.js
// Central state store — survives tab switches within session
// Drop into src/store/useAppStore.js

import { useState, useCallback } from 'react'

let _state = {
  leads: [],
  applications: [],
  recruiters: {},   // keyed by recruiter_email
  archivedLeads: [],
}

const _listeners = new Set()

function setState(updater) {
  _state = typeof updater === 'function' ? updater(_state) : { ..._state, ...updater }
  _listeners.forEach(fn => fn(_state))
}

export function useAppStore() {
  const [, rerender] = useState(0)

  const subscribe = useCallback(() => {
    const fn = () => rerender(n => n + 1)
    _listeners.add(fn)
    return () => _listeners.delete(fn)
  }, [])

  // Call on mount
  const getState = () => _state

  // ── Leads ──────────────────────────────────────────────────────────────────
  const setLeads = (leads) => setState(s => ({ ...s, leads }))

  const addLeads = (newLeads) => setState(s => {
    const existingIds = new Set(s.leads.map(l => l.id))
    const fresh = newLeads.filter(l => !existingIds.has(l.id))
    return { ...s, leads: [...s.leads, ...fresh] }
  })

  const updateLead = (id, patch) => setState(s => ({
    ...s,
    leads: s.leads.map(l => l.id === id ? { ...l, ...patch } : l)
  }))

  const archiveLead = (id) => setState(s => {
    const lead = s.leads.find(l => l.id === id)
    if (!lead) return s
    return {
      ...s,
      leads: s.leads.filter(l => l.id !== id),
      archivedLeads: [...s.archivedLeads, { ...lead, archived_at: new Date().toISOString() }]
    }
  })

  const prioritizeLead = (id, priority) => updateLead(id, { priority })

  // ── Applications ───────────────────────────────────────────────────────────
  const APPLICATION_STAGES = ['Applied', 'Reply', 'Interview Pending', 'Interviewed', 'Offer', 'Closed']

  const logApplication = (app) => setState(s => {
    const exists = s.applications.find(a => a.id === app.id)
    if (exists) return { ...s, applications: s.applications.map(a => a.id === app.id ? { ...a, ...app } : a) }
    return { ...s, applications: [...s.applications, { ...app, logged_at: new Date().toISOString() }] }
  })

  const advanceStage = (id) => setState(s => ({
    ...s,
    applications: s.applications.map(a => {
      if (a.id !== id) return a
      const idx = APPLICATION_STAGES.indexOf(a.status)
      const next = APPLICATION_STAGES[Math.min(idx + 1, APPLICATION_STAGES.length - 1)]
      return { ...a, status: next, updated_at: new Date().toISOString() }
    })
  }))

  const setApplicationStatus = (id, status) => setState(s => ({
    ...s,
    applications: s.applications.map(a => a.id === id ? { ...a, status, updated_at: new Date().toISOString() } : a)
  }))

  // ── Recruiters ─────────────────────────────────────────────────────────────
  const rateRecruiter = (email, rating, notes) => setState(s => ({
    ...s,
    recruiters: {
      ...s.recruiters,
      [email]: { ...(s.recruiters[email] || {}), email, rating, notes, updated_at: new Date().toISOString() }
    }
  }))

  return {
    ...getState(),
    APPLICATION_STAGES,
    setLeads,
    addLeads,
    updateLead,
    archiveLead,
    prioritizeLead,
    logApplication,
    advanceStage,
    setApplicationStatus,
    rateRecruiter,
    subscribe,
  }
}

