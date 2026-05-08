import { useState } from 'react'
import { Zap, ArrowRight } from 'lucide-react'

const DAYS_LEFT = Math.max(0, Math.ceil((new Date('2026-06-03') - new Date()) / (1000 * 60 * 60 * 24)))

const STATS = [
  { label: 'Leads found',  val: 51,       delta: 'From agent runs',  cls: 'accent' },
  { label: 'Applied',      val: 0,         delta: '—',                cls: '' },
  { label: 'In progress',  val: 0,         delta: '—',                cls: '' },
  { label: 'Interviews',   val: 0,         delta: '—',                cls: '' },
  { label: 'Days left',    val: DAYS_LEFT, delta: 'Until June 3',     cls: 'warn' },
]

const DEFAULT_ACTIONS = [
  { label: 'Apply — Harris County Sr. BA', detail: '94% match · Closes 5/23/2026 — URGENT', urgent: true },
  { label: 'Reply to Cole Withers (Kforce)', detail: 'Confirm which roles are still active', urgent: true },
  { label: 'Connect with Staci Wells on LinkedIn', detail: 'Backup recruiter at Kforce — HPE account', urgent: true },
  { label: 'Apply — Capco Agile Delivery Manager', detail: '97% match · You did this exact role 2021-24', urgent: false },
  { label: 'Apply — Deloitte Sr Consultant Agile/SAFe', detail: '93% match · Returnee advantage', urgent: false },
  { label: 'Register at EY GigNow', detail: 'app.gignow.com/ey — alumni welcomed', urgent: false },
  { label: 'Register at KPMG Assignment Select', detail: 'kpmguscareers.com/contractor', urgent: false },
]

export default function DashboardPage({ onNavigate, leads = [], applications = [] }) {
  const [checked, setChecked] = useState({})

  const toggle = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }))

  // Use live leads if available, fall back to static
  const topLeads = leads.length > 0
    ? [...leads].sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).slice(0, 5)
    : [
        { role_title: 'Agile Delivery Manager / Sr. BA', company: 'Capco',         match_score: 97, status: 'New', days_posted: 14 },
        { role_title: 'Sr. Business Analyst',            company: 'Harris County',  match_score: 94, status: 'New', days_posted: 5  },
        { role_title: 'Agile & Data Management BA',      company: 'Kforce',         match_score: 94, status: 'New', days_posted: 3  },
        { role_title: 'Sr Consultant Agile/SAFe',        company: 'Deloitte',       match_score: 93, status: 'New', days_posted: 8  },
        { role_title: 'CFO/F&A Technology BA',           company: 'KPMG',           match_score: 93, status: 'New', days_posted: 11 },
      ]

  const applied      = applications.length
  const inProgress   = applications.filter(a => !['Applied','Closed'].includes(a.status)).length
  const interviews   = applications.filter(a => ['Interview Pending','Interviewed'].includes(a.status)).length

  const liveStats = [
    { label: 'Leads found', val: leads.length || 51,  delta: 'From agent runs', cls: 'accent' },
    { label: 'Applied',     val: applied,              delta: '—',              cls: '' },
    { label: 'In progress', val: inProgress,           delta: '—',              cls: '' },
    { label: 'Interviews',  val: interviews,           delta: '—',              cls: '' },
    { label: 'Days left',   val: DAYS_LEFT,            delta: 'Until June 3',   cls: 'warn' },
  ]

  const uncheckedCount = DEFAULT_ACTIONS.filter((_, i) => !checked[i]).length

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Command Center</div>
        <div className="page-sub">Target: Contract or FT by June 3 · QA · BA · PM · Agile · Product Manager</div>
      </div>

      <div className="stats-row">
        {liveStats.map(s => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <div className="s-label">{s.label}</div>
            <div className="s-val">{s.val}</div>
            <div className="s-delta">{s.delta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Top Leads */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Top leads
            <button className="btn btn-sm btn-accent" onClick={() => onNavigate('leads')}>
              View all <ArrowRight size={11} />
            </button>
          </div>
          {topLeads.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.role_title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                  {r.company}{r.days_posted != null ? ` · ${r.days_posted}d ago` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span className="pill pill-new">{r.status || 'New'}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
                  {r.match_score}%
                </span>
              </div>
            </div>
          ))}
          <div style={{ paddingBottom: 4 }} />
        </div>

        {/* Priority Actions — with working checkboxes */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Zap size={15} color="var(--warn)" />
              Priority actions
            </span>
            {uncheckedCount < DEFAULT_ACTIONS.length && (
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>
                {DEFAULT_ACTIONS.length - uncheckedCount}/{DEFAULT_ACTIONS.length} done
              </span>
            )}
          </div>
          {DEFAULT_ACTIONS.map((a, i) => (
            <div
              key={i}
              onClick={() => toggle(i)}
              style={{
                display: 'flex', gap: 10, padding: '8px 0',
                borderBottom: i < DEFAULT_ACTIONS.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer', opacity: checked[i] ? 0.45 : 1,
                transition: 'opacity .2s',
              }}
            >
              {/* Checkbox */}
              <div style={{
                marginTop: 2, width: 15, height: 15, borderRadius: 4, flexShrink: 0,
                border: `1.5px solid ${checked[i] ? 'var(--success)' : a.urgent ? 'var(--warn)' : 'var(--border2)'}`,
                background: checked[i] ? 'rgba(62,207,142,0.15)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .15s',
              }}>
                {checked[i] && <span style={{ fontSize: 10, color: 'var(--success)', lineHeight: 1 }}>✓</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 500,
                  color: checked[i] ? 'var(--text3)' : 'var(--text)',
                  textDecoration: checked[i] ? 'line-through' : 'none',
                  transition: 'all .15s',
                }}>
                  {a.label}
                </div>
                <div style={{ fontSize: 11, color: checked[i] ? 'var(--text3)' : a.urgent ? 'var(--warn)' : 'var(--text3)' }}>
                  {a.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent run log */}
      <div style={{ marginTop: 16 }} className="card">
        <div className="card-title">Agent run log</div>
        <div className="run-row">
          <div className="run-dot run-ok" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>May 7, 2026 · Last run</span>
          <span style={{ fontSize: 12, color: 'var(--text)' }}>Agent 1 + 2 — 51 leads in table</span>
          <span className="pill pill-new" style={{ marginLeft: 'auto' }}>51 leads</span>
        </div>
        <div style={{ padding: '8px 0', fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
          Next run: click Agents → Run · or set up Make.com scheduler (Option B)
        </div>
      </div>
    </div>
  )
}
