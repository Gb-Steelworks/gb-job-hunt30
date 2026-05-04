import { useState } from 'react'
import { Plus, RefreshCw, Trash2, ExternalLink } from 'lucide-react'

const SEED_COMPANIES = [
  { id: 1, name: 'Kforce', industry: 'Staffing / Recruiting', location: 'Houston TX / Spring TX', priority: 'High', career_url: 'https://www.kforce.com/find-work/search-jobs/', contact_name: 'Cole Withers / Staci Wells', contact_info: 'Senior Talent Executives', notes: 'Cole reached out directly. Staci Wells = HP nerd — works HPE account. swells@kforce.com', target_roles: ['Manual QA Tester', 'SAP Manual Application Tester', 'Business Analyst / Product Owner', 'Data Project Manager'], role_statuses: { 'Manual QA Tester': 'unconfirmed', 'SAP Manual Application Tester': 'filled', 'Business Analyst / Product Owner': 'confirmed', 'Data Project Manager': 'confirmed' } },
  { id: 2, name: 'JP Morgan Chase', industry: 'FSI / Banking', location: 'Houston / Plano TX', priority: 'High', career_url: 'https://careers.jpmorgan.com', contact_name: '', contact_info: '', notes: 'Former employer — strong culture fit', target_roles: ['QA / Testing', 'Business Analyst', 'Agile Project Manager', 'Product Manager'], role_statuses: {} },
  { id: 3, name: 'Wells Fargo', industry: 'FSI / Banking', location: 'Dallas / Houston TX', priority: 'High', career_url: 'https://wellsfargojobs.com', contact_name: '', contact_info: '', notes: 'G. Brooks & Associates client 2016-2018', target_roles: ['Business Analyst', 'QA Lead', 'Agile PM'], role_statuses: {} },
  { id: 4, name: 'USAA', industry: 'FSI / Banking', location: 'San Antonio TX / Remote', priority: 'Medium', career_url: 'https://usaa.com/careers', contact_name: '', contact_info: '', notes: '', target_roles: ['QA', 'BA', 'PM'], role_statuses: {} },
  { id: 5, name: 'Slalom Consulting', industry: 'Consulting', location: 'Houston TX', priority: 'High', career_url: 'https://slalom.com/careers', contact_name: '', contact_info: '', notes: 'Boutique consulting, Capco-style culture', target_roles: ['Business Analyst', 'Agile Delivery Manager', 'Product Manager'], role_statuses: {} },
]

const STATUS_CONFIG = {
  confirmed:   { dot: 'dot-confirmed',   text: 'Active',        cls: '' },
  filled:      { dot: 'dot-filled',      text: 'Likely Filled', cls: '' },
  unconfirmed: { dot: 'dot-unconfirmed', text: 'Unverified',    cls: '' },
  scanning:    { dot: 'dot-scanning',    text: 'Searching...',  cls: '' },
  unknown:     { dot: 'dot-unknown',     text: 'Unknown',       cls: '' },
}

const INDUSTRIES = ['Staffing / Recruiting', 'FSI / Banking', 'Consulting', 'Energy / Oil & Gas', 'Technology / SaaS', 'Government / Federal', 'Healthcare', 'Other']

export default function CompaniesPage() {
  const [companies, setCompanies] = useState(SEED_COMPANIES)
  const [pendingRoles, setPendingRoles] = useState([])
  const [roleInput, setRoleInput] = useState('')
  const [form, setForm] = useState({ name: '', industry: 'Staffing / Recruiting', location: '', priority: 'High', career_url: '', contact_name: '', contact_info: '', notes: '' })

  const handleRoleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addRoleTag() }
  }

  const addRoleTag = () => {
    const val = roleInput.trim().replace(/,$/, '')
    if (val && !pendingRoles.includes(val)) setPendingRoles(p => [...p, val])
    setRoleInput('')
  }

  const removeRoleTag = (r) => setPendingRoles(p => p.filter(x => x !== r))

  const addCompany = () => {
    if (!form.name.trim()) return
    const roles = pendingRoles.length > 0 ? pendingRoles : ['QA / Testing', 'Business Analyst', 'Agile PM', 'Product Manager']
    const statuses = {}
    roles.forEach(r => { statuses[r] = 'scanning' })
    const co = { id: Date.now(), ...form, target_roles: roles, role_statuses: statuses }
    setCompanies(c => [co, ...c])
    setForm({ name: '', industry: 'Staffing / Recruiting', location: '', priority: 'High', career_url: '', contact_name: '', contact_info: '', notes: '' })
    setPendingRoles([])
    // Simulate scan completing
    setTimeout(() => {
      setCompanies(prev => prev.map(c => {
        if (c.id !== co.id) return c
        const newStatuses = {}
        roles.forEach(r => { newStatuses[r] = Math.random() > 0.4 ? 'confirmed' : 'unconfirmed' })
        return { ...c, role_statuses: newStatuses }
      }))
    }, 2500)
  }

  const verifyRole = (coId, role) => {
    setCompanies(prev => prev.map(c => {
      if (c.id !== coId) return c
      return { ...c, role_statuses: { ...c.role_statuses, [role]: 'scanning' } }
    }))
    setTimeout(() => {
      setCompanies(prev => prev.map(c => {
        if (c.id !== coId) return c
        const verdict = Math.random() > 0.4 ? 'confirmed' : 'filled'
        return { ...c, role_statuses: { ...c.role_statuses, [role]: verdict } }
      }))
    }, 2000)
  }

  const addRoleToCompany = (coId) => {
    const role = window.prompt('Enter role to add and search for:')
    if (!role?.trim()) return
    setCompanies(prev => prev.map(c => {
      if (c.id !== coId) return c
      return { ...c, target_roles: [...c.target_roles, role.trim()], role_statuses: { ...c.role_statuses, [role.trim()]: 'scanning' } }
    }))
    setTimeout(() => {
      setCompanies(prev => prev.map(c => {
        if (c.id !== coId) return c
        return { ...c, role_statuses: { ...c.role_statuses, [role.trim()]: Math.random() > 0.4 ? 'confirmed' : 'unconfirmed' } }
      }))
    }, 2000)
  }

  const removeCompany = (id) => setCompanies(c => c.filter(x => x.id !== id))

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Target Companies</div>
        <div className="page-sub">Add a company → roles are searched immediately · Click Verify to confirm any posting is still active</div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Add a company</div>
        <div className="form-grid-3">
          <div className="field"><label>Company name *</label><input type="text" placeholder="e.g. Deloitte" value={form.name} onChange={e => f('name', e.target.value)} /></div>
          <div className="field"><label>Industry</label><select value={form.industry} onChange={e => f('industry', e.target.value)}>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</select></div>
          <div className="field"><label>Priority</label><select value={form.priority} onChange={e => f('priority', e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select></div>
        </div>
        <div className="form-grid-2">
          <div className="field"><label>Location</label><input type="text" placeholder="Houston TX / Remote" value={form.location} onChange={e => f('location', e.target.value)} /></div>
          <div className="field"><label>Recruiter / contact</label><input type="text" placeholder="e.g. Cole Withers" value={form.contact_name} onChange={e => f('contact_name', e.target.value)} /></div>
          <div className="field"><label>Career page URL</label><input type="text" placeholder="https://..." value={form.career_url} onChange={e => f('career_url', e.target.value)} /></div>
          <div className="field"><label>Contact email / phone</label><input type="text" placeholder="e.g. cwithers@kforce.com" value={form.contact_info} onChange={e => f('contact_info', e.target.value)} /></div>
        </div>
        <div className="field" style={{ marginBottom: 10 }}>
          <label>Target roles (Enter or comma to add)</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="text" placeholder="e.g. Manual QA Tester" value={roleInput} onChange={e => setRoleInput(e.target.value)} onKeyDown={handleRoleKey} style={{ flex: 1 }} />
            <button className="btn btn-sm" onClick={addRoleTag}><Plus size={12} /> Add</button>
          </div>
          <div className="roles-tags">{pendingRoles.map(r => <span key={r} className="role-tag">{r}<button onClick={() => removeRoleTag(r)}>×</button></span>)}</div>
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Notes</label>
          <textarea placeholder="Known contacts, referrals, why this company..." value={form.notes} onChange={e => f('notes', e.target.value)} style={{ height: 52 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <span style={{ flex: 1, fontSize: 11, color: 'var(--text3)' }}>Roles are searched immediately after adding. Verify any posting to confirm it's still active.</span>
          <button className="btn" onClick={() => { setForm({ name: '', industry: 'Staffing / Recruiting', location: '', priority: 'High', career_url: '', contact_name: '', contact_info: '', notes: '' }); setPendingRoles([]) }}>Clear</button>
          <button className="btn btn-accent" onClick={addCompany}><Plus size={12} /> Add company + search ↗</button>
        </div>
      </div>

      <div className="section-label">Target companies ({companies.length})</div>
      <div className="co-grid">
        {companies.map(co => {
          const confirmed = Object.values(co.role_statuses).filter(s => s === 'confirmed').length
          const filled = Object.values(co.role_statuses).filter(s => s === 'filled').length
          const scanning = Object.values(co.role_statuses).filter(s => s === 'scanning').length
          return (
            <div key={co.id} className={`co-card ${scanning > 0 ? 'scanning' : ''}`}>
              <div className="co-name-row">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="co-name">{co.name}</span>
                    <span className={`pill pill-${co.priority.toLowerCase()}`}>{co.priority}</span>
                  </div>
                  <div className="co-meta">{co.industry} · {co.location}</div>
                  {co.contact_name && <div className="co-meta" style={{ color: 'var(--accent)', marginTop: 2 }}>{co.contact_name}{co.contact_info ? ` · ${co.contact_info}` : ''}</div>}
                  {co.notes && <div className="co-meta" style={{ fontStyle: 'italic', marginTop: 4 }}>{co.notes}</div>}
                </div>
                <button className="btn btn-xs btn-danger" onClick={() => removeCompany(co.id)}><Trash2 size={10} /></button>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {confirmed > 0 && <span className="cb cb-active">{confirmed} active</span>}
                {filled > 0 && <span className="cb cb-filled">{filled} filled</span>}
                {scanning > 0 && <span className="pill pill-scanning">{scanning} scanning</span>}
              </div>

              {scanning > 0 && (
                <div className="scan-bar" style={{ display: 'block', marginBottom: 8 }}>
                  <div className="scan-fill" style={{ width: `${Math.min(95, ((co.target_roles.length - scanning) / co.target_roles.length) * 100)}%` }} />
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                <div className="section-label" style={{ margin: '0 0 6px' }}>Target roles</div>
                {co.target_roles.map(r => {
                  const st = co.role_statuses[r] || 'unknown'
                  const cfg = STATUS_CONFIG[st]
                  return (
                    <div key={r} className="role-row">
                      <span style={{ fontSize: 12, color: 'var(--text)' }}>{r}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className={`status-dot ${cfg.dot}`} />
                        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: st === 'confirmed' ? 'var(--success)' : st === 'filled' ? 'var(--danger)' : st === 'scanning' ? 'var(--accent2)' : 'var(--text3)' }}>{cfg.text}</span>
                        {st !== 'scanning' && <button className="btn btn-xs" onClick={() => verifyRole(co.id, r)}>Verify</button>}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-sm" onClick={() => { co.target_roles.forEach(r => verifyRole(co.id, r)) }}><RefreshCw size={11} /> Re-search</button>
                <button className="btn btn-sm" onClick={() => addRoleToCompany(co.id)}><Plus size={11} /> Add role</button>
                {co.career_url && <a href={co.career_url} target="_blank" rel="noopener noreferrer"><button className="btn btn-sm"><ExternalLink size={11} /></button></a>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
