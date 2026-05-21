// src/pages/AgentsPage.jsx
// Agent A: Memory-based (instant, always returns leads)
// Agent B: Live web search (real postings, slower)

import { useState } from 'react'
import { Bot, Clock, Zap, Loader, AlertCircle } from 'lucide-react'

const DEADLINE = new Date('2026-06-10') // extended by 7 days
const DAYS_LEFT = Math.max(0, Math.ceil((DEADLINE - new Date()) / (1000 * 60 * 60 * 24)))

const GEORGE_PROFILE = `Candidate: George Brooks, Houston TX
Target roles (priority order):
1. Business Analyst / Senior BA / Lead BA
2. Agile Project Manager / Scrum Master / Delivery Manager
3. Product Manager / Product Owner
4. Manual QA Lead / QA Manager / QA Director / Test Lead

Work preference: Remote first, Houston TX hybrid/onsite acceptable, Dallas/Austin TX considered
Contract OR Full-Time — needs role by June 10, 2026
Rate: $55-85/hr contract · $110-140K FT

Background: 20+ years FSI, federal govt, enterprise tech
Key employers: JPMC, Capco, Deloitte, Makpar/IRS, Supply Bistro
Certs: CSM, SAFe POPM, PMP (exp Jun 2026), Azure, Gen AI
Tools: JIRA, Confluence, Power BI, Selenium, Smartsheet, Azure`

// ── Agent A: Memory-based system prompt ──────────────────────────────────────
const SYSTEM_A1 = `You are a job search agent for George Brooks, Houston TX.

Generate a list of realistic, high-probability job leads from staffing firms and job boards that would currently be hiring for his profile. Base this on your knowledge of these firms' typical active roles for senior BA/PM/QA/Agile professionals in Texas and remote.

Firms to cover: TekSystems, Kforce, Judge Group, Insight Global, Apex Group, CyberCoders, Aerotek, TEKsystems, Robert Half Technology.
Locations: Houston TX, Dallas TX, Austin TX, Remote.

Return ONLY a valid JSON array, no markdown, no explanation.
Each object:
{
  "role_title": string,
  "company": string,
  "via": string,
  "category": "QA" | "BA" | "PM" | "Consulting",
  "type": "Contract" | "Full-Time" | "Contract-to-Hire",
  "work_model": "Remote" | "Hybrid" | "On-site",
  "location": string,
  "pay_rate": string,
  "days_posted": number | null,
  "match_score": number,
  "contact_name": string,
  "contact_email": string,
  "apply_link": string,
  "notes": string
}

Return 8-10 leads. match_score 75-98 based on George's FSI/Agile/BA/QA background.
For apply_link use the firm's job search page (e.g. https://www.kforce.com/find-work/search-jobs/).
Be realistic — only roles that would genuinely exist for a 20-year senior professional.`

const SYSTEM_A2 = `You are a job search agent for George Brooks, Houston TX.

Generate a list of realistic, high-probability job leads from FSI firms, boutique consulting firms, and government entities that would currently be hiring for his profile.

Firms to cover: Capco, Deloitte, KPMG, EY, Accenture, Slalom, West Monroe, Pariveda, Huron, JPMC, Wells Fargo, USAA, Frost Bank, City of Houston, Harris County.
Locations: Houston TX, Dallas TX, Remote.

Return ONLY a valid JSON array, no markdown, no explanation.
Each object:
{
  "role_title": string,
  "company": string,
  "via": string,
  "category": "QA" | "BA" | "PM" | "Consulting",
  "type": "Contract" | "Full-Time" | "Contract-to-Hire",
  "work_model": "Remote" | "Hybrid" | "On-site",
  "location": string,
  "pay_rate": string,
  "days_posted": number | null,
  "match_score": number,
  "contact_name": string,
  "contact_email": string,
  "apply_link": string,
  "notes": string
}

Return 8-10 leads. match_score 75-98 based on George's FSI/consulting/Capco/Deloitte background.
For apply_link use the firm's careers page.
Prioritize consulting roles — George has Capco (2021-24) and Deloitte (2011-14) tenure which gives returnee advantage.`

// ── Agent B: Live web search system prompt ────────────────────────────────────
const SYSTEM_B1 = `You are a job search agent. Use web_search to find real live job postings.
Return ONLY a valid JSON array. Each object: { "role_title": string, "company": string, "via": string, "category": "QA"|"BA"|"PM"|"Consulting", "type": "Contract"|"Full-Time"|"Contract-to-Hire"|"Unknown", "work_model": "Remote"|"Hybrid"|"On-site"|"Unknown", "location": string, "pay_rate": string, "days_posted": number|null, "match_score": number, "contact_name": string, "contact_email": string, "apply_link": string, "notes": string }
Use LinkedIn/Indeed URLs as apply_link if no direct ATS link. Return [] only if truly nothing found.`

const SYSTEM_B2 = SYSTEM_B1

const SEARCHES_B1 = [
  'Kforce contract senior business analyst Houston Texas remote 2026',
  'TekSystems contract agile project manager scrum master Houston Texas 2026',
  'Judge Group contract business analyst QA lead Houston Texas 2026',
]

const SEARCHES_B2 = [
  'Capco Deloitte Slalom agile delivery manager business analyst Houston Texas jobs 2026',
  'Harris County KPMG Accenture business analyst project manager Houston Texas 2026',
]

// ── API call ──────────────────────────────────────────────────────────────────
async function callClaude({ system, userMessage, useLiveSearch = false }) {
  const body = {
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system,
    messages: [{ role: 'user', content: userMessage }],
  }

  if (useLiveSearch) {
    body.tools = [{ type: 'web_search_20250305', name: 'web_search' }]
  }

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (data.error) {
    const msg = typeof data.error === 'string' ? data.error : data.error?.message || JSON.stringify(data.error)
    throw new Error(msg)
  }

  const text = (data.content || [])
    .filter(b => b.type === 'text')
    .map(b => b.text || '')
    .join('')
    .trim()

  if (!text) return []
  const cleaned = text.replace(/```json|```/g, '').trim()
  const start = cleaned.indexOf('[')
  const end = cleaned.lastIndexOf(']')
  if (start === -1 || end === -1) return []
  try { return JSON.parse(cleaned.slice(start, end + 1)) } catch { return [] }
}

const AUTOMATION = [
  { label: 'Option A — Manual', detail: 'Click Run on each agent every Mon/Wed/Fri. Takes 2 min.', effort: 'Zero setup' },
  { label: 'Option B — Make.com', detail: 'Free tier. Fires every 48h at 8 AM CT, emails digest to ghbrooks4@gmail.com.', effort: '30 min setup' },
  { label: 'Option C — Vercel cron', detail: 'Add /api/run-agents.js + Supabase to persist leads automatically.', effort: '1-2 sessions' },
]

export default function AgentsPage({ onLeadsFound, extraPatterns = [] }) {
  const [states, setStates] = useState({
    A1: { status: 'idle', lastRun: 'Never', leadsFound: null, log: [] },
    A2: { status: 'idle', lastRun: 'Never', leadsFound: null, log: [] },
    B1: { status: 'idle', lastRun: 'Never', leadsFound: null, log: [] },
    B2: { status: 'idle', lastRun: 'Never', leadsFound: null, log: [] },
  })

  const addLog = (id, msg) => setStates(prev => ({
    ...prev,
    [id]: { ...prev[id], log: [...(prev[id].log || []), `${new Date().toLocaleTimeString()} — ${msg}`] }
  }))

  const runAgent = async (id) => {
    setStates(prev => ({ ...prev, [id]: { ...prev[id], status: 'running', log: [] } }))

    const isLive = id.startsWith('B')
    const agentNum = id[1]

    addLog(id, `Starting ${isLive ? 'live web search' : 'memory-based'} agent ${agentNum}...`)
    if (isLive) addLog(id, 'Running live searches — may take 30–60 seconds...')
    else addLog(id, 'Generating leads from training knowledge — usually 10–15 seconds...')

    const extraContext = extraPatterns.length > 0
      ? `\n\nAlso include roles similar to: ${extraPatterns.map(p => `${p.role_title} at ${p.company}`).join(', ')}`
      : ''

    try {
      let leads = []

      if (id === 'A1') {
        leads = await callClaude({
          system: SYSTEM_A1,
          userMessage: `Generate job leads for George Brooks from staffing firms.\n\n${GEORGE_PROFILE}${extraContext}\n\nReturn 8-10 leads as a JSON array.`,
        })
      } else if (id === 'A2') {
        leads = await callClaude({
          system: SYSTEM_A2,
          userMessage: `Generate job leads for George Brooks from FSI and consulting firms.\n\n${GEORGE_PROFILE}${extraContext}\n\nReturn 8-10 leads as a JSON array.`,
        })
      } else if (id === 'B1') {
        const searches = SEARCHES_B1.map((s, i) => `${i + 1}. ${s}`).join('\n')
        leads = await callClaude({
          system: SYSTEM_B1,
          userMessage: `Find live job postings for:\n${GEORGE_PROFILE}${extraContext}\n\nSearch queries:\n${searches}\n\nReturn JSON array of all real postings found.`,
          useLiveSearch: true,
        })
      } else if (id === 'B2') {
        const searches = SEARCHES_B2.map((s, i) => `${i + 1}. ${s}`).join('\n')
        leads = await callClaude({
          system: SYSTEM_B2,
          userMessage: `Find live job postings for:\n${GEORGE_PROFILE}${extraContext}\n\nSearch queries:\n${searches}\n\nReturn JSON array of all real postings found.`,
          useLiveSearch: true,
        })
      }

      if (!Array.isArray(leads)) throw new Error('Invalid response — expected JSON array')

      const filtered = leads.filter(l => l.apply_link && l.role_title)
      const stamped = filtered.map((l, i) => ({
        ...l,
        id: Date.now() + i,
        status: 'New',
        agent: id,
      }))

      setStates(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          status: 'idle',
          lastRun: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          leadsFound: stamped.length,
          log: [
            ...(prev[id].log || []),
            `${new Date().toLocaleTimeString()} — ✅ ${stamped.length} leads found`
          ]
        }
      }))

      if (stamped.length > 0) onLeadsFound?.(stamped)
      else addLog(id, '⚠️ No leads returned — try again')

    } catch (e) {
      setStates(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          status: 'error',
          log: [...(prev[id].log || []), `${new Date().toLocaleTimeString()} — ❌ Error: ${e.message}`]
        }
      }))
    }
  }

  const AGENTS = [
    {
      id: 'A1',
      name: 'Agent A1 — Job Scout (instant)',
      icon: Bot,
      color: 'var(--accent)',
      badge: 'FAST',
      badgeColor: 'var(--success)',
      desc: 'Memory-based — generates leads from TekSystems, Kforce, Judge Group, Insight Global, Indeed, LinkedIn. Instant results, always works. Verify links manually.',
    },
    {
      id: 'A2',
      name: 'Agent A2 — FSI & Boutique (instant)',
      icon: Bot,
      color: 'var(--accent)',
      badge: 'FAST',
      badgeColor: 'var(--success)',
      desc: 'Memory-based — generates leads from Capco, Deloitte, KPMG, EY, Slalom, West Monroe, JPMC, Harris County. Instant results, always works.',
    },
    {
      id: 'B1',
      name: 'Agent B1 — Job Scout (live search)',
      icon: Zap,
      color: 'var(--accent2)',
      badge: 'LIVE',
      badgeColor: 'var(--accent2)',
      desc: 'Live web search — hits real job boards for verified current postings. Slower (30–60s), subject to rate limits. Run after A agents.',
    },
    {
      id: 'B2',
      name: 'Agent B2 — FSI & Boutique (live search)',
      icon: Zap,
      color: 'var(--accent2)',
      badge: 'LIVE',
      badgeColor: 'var(--accent2)',
      desc: 'Live web search — searches Capco, Deloitte, Slalom, Harris County career pages for real current postings. Run after B1 finishes.',
    },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Agents</div>
        <div className="page-sub">
          A agents: instant memory-based leads · B agents: live web search · Deadline extended to June 10
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        padding: '10px 14px', marginBottom: 16,
        background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.2)',
        borderRadius: 'var(--radius)', fontSize: 11, fontFamily: 'var(--font-mono)',
      }}>
        <span style={{ color: 'var(--success)' }}>● A agents — instant, always return leads</span>
        <span style={{ color: 'var(--accent2)' }}>● B agents — live search, real postings</span>
        <span style={{ color: 'var(--text3)' }}>Model: claude-sonnet-4-6</span>
        <span style={{ color: 'var(--warn)' }}>⏱ {DAYS_LEFT} days until June 10 deadline</span>
      </div>

      <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
        {AGENTS.map(a => {
          const s = states[a.id]
          const isRunning = s.status === 'running'
          const isError = s.status === 'error'
          return (
            <div key={a.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: a.color + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {isRunning
                      ? <Loader size={16} color={a.color} style={{ animation: 'spin .8s linear infinite' }} />
                      : isError
                        ? <AlertCircle size={16} color="var(--danger)" />
                        : <a.icon size={16} color={a.color} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{a.name}</span>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 6px',
                        borderRadius: 4, background: a.badgeColor + '22',
                        color: a.badgeColor, fontFamily: 'var(--font-mono)',
                      }}>{a.badge}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{a.desc}</div>
                  </div>
                </div>
                <button
                  className="btn btn-accent"
                  style={{ flexShrink: 0 }}
                  disabled={isRunning}
                  onClick={() => runAgent(a.id)}
                >
                  {isRunning
                    ? <><Loader size={11} style={{ animation: 'spin .8s linear infinite' }} /> Running...</>
                    : 'Run ↗'}
                </button>
              </div>

              <div style={{
                display: 'flex', gap: 16, marginTop: 12, paddingTop: 12,
                borderTop: '1px solid var(--border)',
                fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text3)',
                flexWrap: 'wrap',
              }}>
                <span><Clock size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />Manual run</span>
                <span>Last: {s.lastRun}</span>
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

      <div className="card">
        <div className="card-title">Auto-scheduling options</div>
        <div style={{ display: 'grid', gap: 10 }}>
          {AUTOMATION.map((opt, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, padding: '10px 0',
              borderBottom: i < AUTOMATION.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ minWidth: 90, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent)', paddingTop: 1, textAlign: 'right' }}>
                {opt.effort}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>{opt.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
