// src/pages/AgentsPage.jsx
// REPLACES the old A1/A2 (memory-based, fabrication-prone) / B1/B2 (live search)
// client-side split. All discovery now goes through api/run-agents.js, which
// always uses live web_search and never asks the model to invent a posting —
// see PATCH notes in the implementation drop for why the old A1/A2 had to go.
//
// Categories come from src/agentCategories.js (single source of truth for
// company lists, keywords, cadence, source method) — this page doesn't
// duplicate that config, it just triggers runs and displays results.

import { useState } from 'react'
import { Bot, Clock, Loader, AlertCircle, PlayCircle } from 'lucide-react'
import { AGENT_CATEGORIES, shouldRunToday } from '../agentCategories.js'

const CATEGORY_META = {
  watchlist:        { label: 'Watchlist Companies',  color: 'var(--accent)' },
  staffing:         { label: 'Staffing Firms',       color: 'var(--accent2)' },
  tier1_consulting: { label: 'Tier 1 Consulting',    color: 'var(--accent)' },
  tier2_consulting: { label: 'Tier 2 Consulting',    color: 'var(--accent2)' },
  government:       { label: 'Government',           color: 'var(--accent)' },
}

export default function AgentsPage({ onLeadsFound }) {
  const [states, setStates] = useState(() =>
    Object.fromEntries(
      Object.keys(AGENT_CATEGORIES).map(key => [key, { status: 'idle', lastRun: null, leadsFound: null, log: [] }])
    )
  )
  const [runningAll, setRunningAll] = useState(false)

  const addLog = (key, msg) => setStates(prev => ({
    ...prev,
    [key]: { ...prev[key], log: [...(prev[key].log || []), `${new Date().toLocaleTimeString()} — ${msg}`] }
  }))

  const runCategories = async (categoryKeys, { force = false } = {}) => {
    categoryKeys.forEach(key => {
      setStates(prev => ({ ...prev, [key]: { ...prev[key], status: 'running', log: [] } }))
      addLog(key, `Starting live search — may take 30-90 seconds per category...`)
    })

    try {
      const params = new URLSearchParams({ categories: categoryKeys.join(',') })
      if (force) params.set('force', 'true')

      const res = await fetch(`/api/run-agents?${params.toString()}`)
      const data = await res.json()

      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`)

      const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

      categoryKeys.forEach(key => {
        const count = data.by_category?.[key] ?? 0
        setStates(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            status: 'idle',
            lastRun: now,
            leadsFound: count,
            log: [...(prev[key].log || []), `${new Date().toLocaleTimeString()} — ✅ ${count} leads found`],
          },
        }))
      })

      // Stamp status:'New' so LeadsPage's status dropdown and mergeAgentLeads
      // dedup-by-id both work the same way they did with the old agent output.
      const stamped = (data.leads || []).map(l => ({ ...l, status: l.status || 'New' }))
      if (stamped.length > 0) {
        setTimeout(() => onLeadsFound?.(stamped), 200)
      }

      if (!data.leads || data.leads.length === 0) {
        categoryKeys.forEach(key => addLog(key, '⚠️ No leads returned this run — that can be correct, not just an error'))
      }
    } catch (e) {
      categoryKeys.forEach(key => {
        setStates(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            status: 'error',
            log: [...(prev[key].log || []), `${new Date().toLocaleTimeString()} — ❌ Error: ${e.message}`],
          },
        }))
      })
    }
  }

  const runOne = (key) => runCategories([key], { force: true })

  const runAllScheduled = async () => {
    setRunningAll(true)
    const today = new Date()
    const scheduledToday = Object.keys(AGENT_CATEGORIES).filter(key => shouldRunToday(key, today))
    if (scheduledToday.length === 0) {
      alert('No categories are scheduled to run today. Use an individual Run Now button to run one anyway.')
      setRunningAll(false)
      return
    }
    await runCategories(scheduledToday)
    setRunningAll(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Agents</div>
        <div className="page-sub">
          Live web search only — every category, every run. Cron fires Mon-Fri; each category
          runs on its own scheduled days automatically.
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-accent" disabled={runningAll} onClick={runAllScheduled}>
          {runningAll
            ? <><Loader size={12} style={{ animation: 'spin .8s linear infinite' }} /> Running scheduled categories...</>
            : <><PlayCircle size={12} /> Run All Scheduled Today</>}
        </button>
      </div>

      <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
        {Object.entries(AGENT_CATEGORIES).map(([key, cfg]) => {
          const meta = CATEGORY_META[key] || { label: key, color: 'var(--accent)' }
          const s = states[key]
          const isRunning = s.status === 'running'
          const isError = s.status === 'error'
          const scheduledToday = shouldRunToday(key, new Date())

          return (
            <div key={key} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: meta.color + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {isRunning
                      ? <Loader size={16} color={meta.color} style={{ animation: 'spin .8s linear infinite' }} />
                      : isError
                        ? <AlertCircle size={16} color="var(--danger)" />
                        : <Bot size={16} color={meta.color} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{meta.label}</span>
                      {scheduledToday && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '2px 6px',
                          borderRadius: 4, background: 'var(--success)22',
                          color: 'var(--success)', fontFamily: 'var(--font-mono)',
                        }}>SCHEDULED TODAY</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
                      {cfg.companies.length} companies · {(cfg.keywords?.length ? cfg.keywords : ['default keywords']).join(', ')}
                    </div>
                  </div>
                </div>
                <button className="btn btn-accent" style={{ flexShrink: 0 }} disabled={isRunning} onClick={() => runOne(key)}>
                  {isRunning
                    ? <><Loader size={11} style={{ animation: 'spin .8s linear infinite' }} /> Running...</>
                    : 'Run Now ↗'}
                </button>
              </div>

              <div style={{
                display: 'flex', gap: 16, marginTop: 12, paddingTop: 12,
                borderTop: '1px solid var(--border)',
                fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text3)',
                flexWrap: 'wrap',
              }}>
                <span><Clock size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  {cfg.days.length === 5 ? 'Mon-Fri' : cfg.days.length === 4 ? 'Mon-Thu' : 'Mon/Wed/Fri'}
                </span>
                <span>Last: {s.lastRun || '—'}</span>
                {s.leadsFound !== null && (
                  <span style={{ color: s.leadsFound > 0 ? 'var(--accent)' : 'var(--warn)' }}>
                    {s.leadsFound} leads found
                  </span>
                )}
                <span style={{
                  marginLeft: 'auto',
                  color: isRunning ? 'var(--accent2)' : isError ? 'var(--danger)' : 'var(--success)',
                }}>● {s.status}</span>
              </div>

              {s.log?.length > 0 && (
                <div style={{
                  marginTop: 10, padding: '8px 10px',
                  background: 'var(--bg)', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)',
                  maxHeight: 100, overflowY: 'auto',
                }}>
                  {s.log.map((line, i) => (
                    <div key={i} style={{
                      color: line.includes('❌') ? 'var(--danger)'
                        : line.includes('✅') ? 'var(--success)'
                        : line.includes('⚠️') ? 'var(--warn)'
                        : 'var(--text3)'
                    }}>{line}</div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
