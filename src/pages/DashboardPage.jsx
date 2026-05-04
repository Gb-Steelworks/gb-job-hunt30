import { Zap, ArrowRight } from 'lucide-react'

const DAYS_LEFT = Math.max(0, Math.ceil((new Date('2026-06-03') - new Date()) / (1000 * 60 * 60 * 24)))

const STATS = [
  { label: 'Leads found', val: 8, delta: 'From 2 agent runs', cls: 'accent' },
  { label: 'Applied', val: 0, delta: '—', cls: '' },
  { label: 'In progress', val: 0, delta: '—', cls: '' },
  { label: 'Interviews', val: 0, delta: '—', cls: '' },
  { label: 'Days left', val: DAYS_LEFT, delta: 'Until June 3', cls: 'warn' },
]

const RECENT = [
  { role: 'IT QA Specialist IV', co: 'Enbridge / Raise', score: 95, status: 'New', age: '26d' },
  { role: 'Business Analyst III', co: 'TEKsystems', score: 92, status: 'New', age: '150d' },
  { role: 'Sr. BA — Customer Comms', co: 'TEKsystems (FSI)', score: 91, status: 'New', age: '7d' },
  { role: 'Senior QA Analyst', co: 'Tekmetric', score: 90, status: 'New', age: '145d' },
]

const ACTIONS = [
  { label: 'Reply to Cole Withers (Kforce)', detail: 'Confirm which roles are still active', urgent: true },
  { label: 'Connect with Staci Wells on LinkedIn', detail: 'Backup recruiter at Kforce — HPE account', urgent: true },
  { label: 'Apply to Enbridge QA Specialist IV', detail: 'Highest match score (95%) — active posting', urgent: false },
  { label: 'Apply to TEKsystems BA III', detail: 'Contact: Kape Kelly · PatrKelly@teksystems.com', urgent: false },
]

export default function DashboardPage({ onNavigate }) {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Command Center</div>
        <div className="page-sub">Target: Contract or FT by June 3 · QA · BA · PM · Agile · Product Manager</div>
      </div>

      <div className="stats-row">
        {STATS.map(s => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <div className="s-label">{s.label}</div>
            <div className="s-val">{s.val}</div>
            <div className="s-delta">{s.delta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Top leads
            <button className="btn btn-sm btn-accent" onClick={() => onNavigate('leads')}>
              View all <ArrowRight size={11} />
            </button>
          </div>
          {RECENT.map(r => (
            <div key={r.role} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{r.role}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{r.co} · {r.age} ago</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="pill pill-new">{r.status}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{r.score}</span>
              </div>
            </div>
          ))}
          <div style={{ paddingBottom: 4 }} />
        </div>

        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Zap size={15} color="var(--warn)" />
            Priority actions
          </div>
          {ACTIONS.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < ACTIONS.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ marginTop: 4, width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: a.urgent ? 'var(--warn)' : 'var(--text3)' }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{a.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{a.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16 }} className="card">
        <div className="card-title">Agent run log</div>
        <div className="run-row">
          <div className="run-dot run-ok" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>May 3, 2026 · 14:32</span>
          <span style={{ fontSize: 12, color: 'var(--text)' }}>Agent 1 + 2 — Manual run from Claude</span>
          <span className="pill pill-new" style={{ marginLeft: 'auto' }}>8 leads</span>
        </div>
        <div style={{ padding: '8px 0', fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
          Next scheduled run: when you click Run Agents, or via Make.com automation
        </div>
      </div>
    </div>
  )
}
