import { Bot, Clock, Zap, Mail } from 'lucide-react'

const AGENTS = [
  {
    id: 1, name: 'Agent 1 — Job Scout', icon: Bot, color: 'var(--accent)',
    desc: 'Searches TEKsystems, Judge Group, LinkedIn, Dice, Indeed, Glassdoor for QA · BA · PM · Agile roles in Texas + remote. Returns structured leads with contact, pay rate, days posted, and apply link.',
    cadence: 'Every 48 hours', lastRun: 'May 3, 2026 · Manual run', leadsFound: 8, status: 'idle',
    prompt: 'Run Agent 1 — Job Scout. Search for QA/Manual Testing, Business Analyst, Agile Project Manager, Scrum Master, and Product Manager roles at TEKsystems, Judge Group, LinkedIn, Dice, Indeed, and Glassdoor. Target Texas (Houston, Dallas, Austin) and remote. Return structured results: role title, company, via, location, work model, type, pay rate, days posted, contact name/email, apply link, match score 0-100.'
  },
  {
    id: 2, name: 'Agent 2 — FSI & Boutique Spotter', icon: Zap, color: 'var(--accent2)',
    desc: 'Searches FSI firms (JPMC, Wells, USAA, Schwab, Fidelity, Frost) and boutique TX consulting firms (Slalom, West Monroe, Pariveda, Opportune) directly on their career pages.',
    cadence: 'Every 48 hours', lastRun: 'May 3, 2026 · Manual run', leadsFound: 0, status: 'idle',
    prompt: 'Run Agent 2 — FSI & Boutique Spotter. Search JP Morgan Chase, Wells Fargo, USAA, Charles Schwab, Fidelity, Frost Bank, Slalom, West Monroe, and Pariveda for open QA, BA, Agile PM, and Product Manager roles. Focus Texas and remote. Try to identify hiring manager names. Return structured results.'
  },
  {
    id: 3, name: 'Agent 3 — Application Prep', icon: Mail, color: 'var(--warn)',
    desc: 'Triggered per-role. When you decide to apply: (1) asks you to confirm, (2) ATS-optimizes your resume for the JD, (3) writes a tailored cover letter, (4) generates recruiter Q&A prep.',
    cadence: 'Per-role trigger', lastRun: 'Never', leadsFound: null, status: 'waiting',
    prompt: 'I want to apply to a role — trigger Agent 3. Ask me for the job title, company, and job description before proceeding.'
  },
]

const AUTOMATION = [
  { label: 'Option A — Manual reminder', detail: 'Set a phone alarm every Mon/Wed/Fri at 8 AM. Open this app and click Run on Agent 1 + 2. Takes 2 minutes.', effort: 'Zero setup' },
  { label: 'Option B — Make.com scheduler', detail: 'Free tier. Build the scenario from make_scenario_agents_1_2.json in your downloaded system package. Fires automatically every 48h at 8 AM CT, emails you a digest.', effort: '30 min setup' },
  { label: 'Option C — n8n (self-hosted)', detail: 'Free, open source, schedulable. Call Claude API every 48h and write results to Google Sheets + email. More control, more setup.', effort: '2hr setup' },
  { label: 'Option D — Email trigger (Agent 3)', detail: 'Already designed. Send yourself an email with subject "APPLY: [Role] at [Company]" with JD in body. Make.com fires Agent 3 and emails back your full package in 60 seconds.', effort: '30 min setup' },
]

export default function AgentsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Agents</div>
        <div className="page-sub">AI agents that search, verify, and prepare your applications · Run manually here or automate via Make.com</div>
      </div>

      <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
        {AGENTS.map(a => (
          <div key={a.id} className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: a.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <a.icon size={16} color={a.color} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{a.desc}</div>
                </div>
              </div>
              <button className="btn btn-accent" style={{ flexShrink: 0 }} onClick={() => window.open(`https://claude.ai/`, '_blank')}>
                Run ↗
              </button>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text3)' }}>
              <span><Clock size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />{a.cadence}</span>
              <span>Last run: {a.lastRun}</span>
              {a.leadsFound !== null && <span style={{ color: 'var(--accent)' }}>{a.leadsFound} leads found</span>}
              <span style={{ marginLeft: 'auto', color: a.status === 'idle' ? 'var(--success)' : 'var(--warn)' }}>● {a.status}</span>
            </div>
          </div>
        ))}
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
    </div>
  )
}
