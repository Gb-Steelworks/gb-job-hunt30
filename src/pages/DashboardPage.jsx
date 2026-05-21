import { useState } from 'react'
import { Zap, ArrowRight, ExternalLink } from 'lucide-react'

const DEADLINE = new Date('2026-06-10')
const DAYS_LEFT = Math.max(0, Math.ceil((DEADLINE - new Date()) / (1000 * 60 * 60 * 24)))

const DEFAULT_ACTIONS = [
  {
    label: 'Apply — Harris County Sr. BA',
    detail: '94% match · Closes 5/23/2026 — URGENT',
    urgent: true,
    link: 'https://www.governmentjobs.com/careers/harriscountytx',
  },
  {
    label: 'Reply to Cole Withers (Kforce)',
    detail: 'Confirm which roles are still active',
    urgent: true,
    link: 'mailto:cwithers@kforce.com',
  },
  {
    label: 'Connect with Staci Wells on LinkedIn',
    detail: 'Backup recruiter at Kforce — HPE account',
    urgent: true,
    link: 'https://www.linkedin.com/search/results/people/?keywords=Staci%20Wells%20Kforce',
  },
  {
    label: 'Apply — Capco Agile Delivery Manager',
    detail: '97% match · You did this exact role 2021-24',
    urgent: false,
    link: 'https://www.capco.com/careers',
  },
  {
    label: 'Apply — Deloitte Sr Consultant Agile/SAFe',
    detail: '93% match · Returnee advantage',
    urgent: false,
    link: 'https://jobsus.deloitte.com/locations/houston-tx/jobs/',
  },
  {
    label: 'Register at EY GigNow',
    detail: 'app.gignow.com/ey — alumni welcomed',
    urgent: false,
    link: 'https://app.gignow.com/ey',
  },
  {
    label: 'Register at KPMG Assignment Select',
    detail: 'kpmguscareers.com/contractor',
    urgent: false,
    link: 'https://us.kpmg.talentnet.community/',
  },
]

const STATIC_LEADS = [
  { role_title: 'Agile Delivery Manager / Sr. BA', company: 'Capco',        match_score: 97, status: 'New', days_posted: 14, apply_link: 'https://www.capco.com/careers' },
  { role_title: 'Sr. Business Analyst',            company: 'Harris County', match_score: 94, status: 'New', days_posted: 5,  apply_link: 'https://www.governmentjobs.com/careers/harriscountytx' },
  { role_title: 'Agile & Data Management BA',      company: 'Kforce',        match_score: 94, status: 'New', days_posted: 3,  apply_link: 'https://www.kforce.com/find-work/search-jobs/' },
  { role_title: 'Sr Consultant Agile/SAFe',        company: 'Deloitte',      match_score: 93, status: 'New', days_posted: 8,  apply_link: 'https://jobsus.deloitte.com/locations/houston-tx/jobs/' },
  { role_title: 'CFO/F&A Technology BA',           company: 'KPMG',          match_score: 93, status: 'New', days_posted: 11, apply_link: 'https://www.kpmguscareers.com/job-search/' },
]

export default function DashboardPage({ onNavigate, leads = [], applications = [] }) {
  const [checked, setChecked] = useState({})

  const toggle = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }))

  const topLeads = leads.length > 0
    ? [...leads].sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).slice(0, 5)
    : STATIC_LEADS

  const applied    = applications.length
  const inProgress = applications.filter(a => !['Applied', 'Closed'].includes(a.status)).length
  const interviews = applications.filter(a => ['Interview Pending', 'Interviewed'].includes(a.status)).length

  const liveStats = [
    { label: 'Leads found', val: leads.length || 51, delta: 'From agent runs', cls: 'accent' },
    { label: 'Applied',     val: applied,             delta: '—',              cls: '' },
    { label: 'In progress', val: inProgress,          delta: '—',              cls: '' },
    { label: 'Interviews',  val: interviews,          delta: '—',              cls: '' },
    { label: 'Days left',   val: DAYS_LEFT,           delta: 'Until June 10',  cls: 'warn' },
  ]

  const uncheckedCount = DEFAULT_ACTIONS.filter((_, i) => !checked[i]).length

  const openLink = (e, url) => {
    e.stopPropagation()
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Command Center</div>
        <div className="page-sub">Target: Contract or FT by June 10 · QA · BA · PM · Agile · Product Manager</div>
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
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: i < topLeads.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
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
                {(r.apply_link || r.applyLink) && (
                  <button
                    onClick={(e) => openLink(e, r.apply_link || r.applyLink)}
                    title="Apply"
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      padding: '2px 4px', borderRadius: 4,
                      color: 'var(--accent)', display: 'flex', alignItems: 'center',
                    }}
                  >
                    <ExternalLink size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div style={{ paddingBottom: 4 }} />
        </div>

        {/* Priority Actions */}
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
              {/* External link button */}
              {a.link && (
                <button
                  onClick={(e) => openLink(e, a.link)}
                  title="Open link"
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    padding: '2px 4px', borderRadius: 4, flexShrink: 0, alignSelf: 'center',
                    color: checked[i] ? 'var(--text3)' : a.urgent ? 'var(--warn)' : 'var(--accent)',
                    opacity: checked[i] ? 0.4 : 1,
                  }}
                >
                  <ExternalLink size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Agent run log */}
      <div style={{ marginTop: 16 }} className="card">
        <div className="card-title">Agent run log</div>
        <div className="run-row">
          <div className="run-dot run-ok" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>May 21, 2026 · Last run</span>
          <span style={{ fontSize: 12, color: 'var(--text)' }}>Agent A1 + A2 — leads in table</span>
          <span className="pill pill-new" style={{ marginLeft: 'auto' }}>{leads.length || 51} leads</span>
        </div>
        <div style={{ padding: '8px 0', fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
          Next run: click Agents → Run A1 or A2 · or set up Make.com scheduler (Option B)
        </div>
      </div>
    </div>
  )
}
