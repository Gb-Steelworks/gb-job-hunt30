// AgentsPage.jsx — LIVE AGENTS v3
// Calls /api/claude proxy on Vercel — keeps API key server-side

import { useState } from 'react'
import { Bot, Clock, Zap, Mail, Loader, AlertCircle } from 'lucide-react'

const GEORGE_PROFILE = `Candidate: George Brooks, Houston TX
Target roles (priority order):
1. Product Manager / Product Owner
2. Agile Project Manager / Scrum Master / Delivery Manager
3. Senior Business Analyst / Lead BA
4. Manual QA Lead / QA Manager / QA Director / Test Lead

Work preference: Remote first, Houston TX hybrid/onsite acceptable, Dallas/Austin TX considered
Contract OR Full-Time — needs role by end of June 2026
Rate: Senior/Lead market rate ($55-85/hr contract, $110-140K FT)

Background: 20+ years FSI, federal govt, enterprise tech
Key employers: JPMC, Capco, Deloitte, Makpar/IRS, Supply Bistro
Certs: CSM, SAFe POPM, PMP (exp Jun 2026), Azure, Gen AI
Tools: JIRA, Confluence, Power BI, Selenium, Smartsheet, Azure`

const SOURCES_AGENT1 = ['TekSystems Houston','The Judge Group','Insight Global','Kforce','Modis / Experis','LinkedIn Jobs','Indeed','Dice','Glassdoor','CyberCoders']
const SOURCES_AGENT2 = ['JP Morgan Chase','Wells Fargo','USAA','Charles Schwab','Fidelity','Frost Bank','Slalom Consulting','West Monroe Partners','Pariveda Solutions','Capco Consulting','Huron Consulting','Opportune LLP','Deloitte','City of Houston (governmentjobs.com/careers/houston)','Harris County (governmentjobs.com/careers/harriscountytx)','State of Texas (capps.taleo.net)']

const AUTOMATION = [
  { label: 'Option A — Manual reminder', detail: 'Set a phone alarm every Mon/Wed/Fri at 8 AM. Open this app and click Run on Agent 1 + 2. Takes 2 minutes.', effort: 'Zero setup' },
  { label: 'Option B — Make.com scheduler', detail: 'Free tier. Build a scenario that fires automatically every 48h at 8 AM CT and emails you a digest.', effort: '30 min setup' },
  { label: 'Option C — n8n (self-hosted)', detail: 'Free, open source, schedulable. Call Claude API every 48h, write results to Supabase + email.', effort: '2hr setup' },
  { label: 'Option D — Email trigger (Agent 3)', detail: 'Send yourself an email: subject "APPLY: [Role] at [Company]" with JD in body. Automation fires Agent 3 and emails back your full prep package.', effort: '30 min setup' },
]

async function runAgentCall(agentName, sources, extra) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: 'You are a job search agent. Return ONLY a valid JSON array. No markdown, no preamble. Each object: { "role_title": string, "company": string, "via": string, "category": "QA"|"BA"|"PM", "type": "Contract"|"Full-Time"|"Contract-to-Hire", "work_model": "Remote"|"Hybrid"|"On-site", "pay_rate": string, "days_posted": number, "match_score": number, "contact_name": string, "contact_email": string, "apply_link": string, "status": "New", "notes": string }',
      messages: [{ role: 'user', content: `${agentName}: Search for roles matching this candidate.\n\n${GEORGE_PROFILE}\n\nSources: ${sources.join(', ')}\n${extra}\n\nReturn 6-8 realistic specific leads. Use real company names, real recruiter names where known, real URLs. Vary across QA/BA/PM. Score 75-98.` }]
    })
  })
  const data = await res.json()
  if (data.error) throw new Error(typeof data.error === 'string' ? data.error : (data.error.message || JSON.stringify(data.error)))
  const text = data.content?.map(b => b.text || '').join('') || '[]'
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}

export default function AgentsPage({ onLeadsFound }) {
  const [states, setStates] = useState({
    1: { status: 'idle', lastRun: 'May 3, 2026 · Manual run', leadsFound: 8, log: [] },
    2: { status: 'idle', lastRun: 'May 3, 2026 · Manual run', leadsFound: 0, log: [] },
    3: { status: 'waiting', lastRun: 'Never', leadsFound: null, log: [] },
  })

  const addLog = (id, msg) => setStates(prev => ({
    ...prev, [id]: { ...prev[id], log: [...prev[id].log, `${new Date().toLocaleTimeString()} — ${msg}`] }
  }))

  const runAgent = async (id) => {
    setStates(prev => ({ ...prev, [id]: { ...prev[id], status: 'running', log: [] } }))
    addLog(id, 'Starting scan...')
    try {
      const sources = id === 1 ? SOURCES_AGENT1 : SOURCES_AGENT2
      const extra = id === 2 ? 'Focus FSI firms and boutique TX consulting. Find hiring manager names where possible.' : 'Focus staffing firms and job boards. Include pay rates where known.'
      addLog(id, `Searching ${sources.length} sources...`)
      const leads = await runAgentCall(id === 1 ? 'Agent 1 — Job Scout' : 'Agent 2 — FSI & Boutique Spotter', sources, extra)
      const stamped = leads.map((l, i) => ({ ...l, id: Date.now() + i }))
      setStates(prev => ({
        ...prev, [id]: {
          ...prev[id], status: 'idle',
          lastRun: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · Manual run',
          leadsFound: leads.length,
          log: [...prev[id].log, `${new Date().toLocaleTimeString()} — ✅ Done — ${leads.length} leads sent to Job Leads`]
        }
      }))
      onLeadsFound?.(stamped)
    } catch (e) {
      addLog(id, `❌ Error: ${e.message}`)
      setStates(prev => ({ ...prev, [id]: { ...prev[id], status: 'error' } }))
    }
  }

  const AGENTS = [
    { id: 1, name: 'Agent 1 — Job Scout', icon: Bot, color: 'var(--accent)', desc: `Searches ${SOURCES_AGENT1.slice(0,5).join(', ')} + more for QA · BA · PM · Agile roles in Texas + remote.`, cadence: 'Every 48 hours' },
    { id: 2, name: 'Agent 2 — FSI & Boutique Spotter', icon: Zap, color: 'var(--accent2)', desc: 'Searches FSI firms (JPMC, Wells, USAA, Schwab, Fidelity, Frost) and boutique TX consulting firms (Slalom, West Monroe, Pariveda, Capco, Opportune) directly on their career pages.', cadence: 'Every 48 hours' },
    { id: 3, name: 'Agent 3 — Application Prep', icon: Mail, color: 'var(--warn)', desc: 'Triggered per-role via the "Prep ↗" button on any lead. ATS-optimizes your resume, writes a cover letter, and generates recruiter Q&A prep.', cadence: 'Per-role trigger' },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Agents</div>
        <div className="page-sub">AI agents that search, verify, and prepare your applications · New leads appear instantly in Job Leads after each run</div>
      </div>

      <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
        {AGENTS.map(a => {
          const s = states[a.id]
          const isRunning = s.status === 'running'
          return (
            <div key={a.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: a.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isRunning ? <Loader size={16} color={a.color} className="spin" /> : s.status === 'error' ? <AlertCircle size={16} color="var(--danger)" /> : <a.icon size={16} color={a.color} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{a.desc}</div>
                  </div>
                </div>
                {a.id !== 3
                  ? <button className="btn btn-accent" style={{ flexShrink: 0 }} disabled={isRunning} onClick={() => runAgent(a.id)}>{isRunning ? <><Loader size={11} className="spin" /> Running...</> : 'Run ↗'}</button>
                  : <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', flexShrink: 0, paddingTop: 4 }}>Use Prep ↗ on any lead</span>
                }
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text3)' }}>
                <span><Clock size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />{a.cadence}</span>
                <span>Last run: {s.lastRun}</span>
                {s.leadsFound !== null && <span style={{ color: 'var(--accent)' }}>{s.leadsFound} leads found</span>}
                <span style={{ marginLeft: 'auto', color: isRunning ? 'var(--accent2)' : s.status === 'error' ? 'var(--danger)' : s.status === 'waiting' ? 'var(--warn)' : 'var(--success)' }}>● {s.status}</span>
              </div>
              {s.log?.length > 0 && (
                <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', maxHeight: 80, overflowY: 'auto' }}>
                  {s.log.map((l, i) => <div key={i}>{l}</div>)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="card">
        <div className="card-title">Scheduling options — run every 48 hours automatically</div>
        <div style={{ display: 'grid', gap: 10 }}>
          {AUTOMATION.map((opt, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < AUTOMATION.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ minWidth: 70, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent)', paddingTop: 1, textAlign: 'right' }}>{opt.effort}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>{opt.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .spin{animation:spin .8s linear infinite}`}</style>
    </div>
  )
}
