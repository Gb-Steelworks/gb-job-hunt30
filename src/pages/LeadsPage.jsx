// LeadsPage.jsx — UPDATED
// Changes from original:
//   1. Imports RoleActionPanel
//   2. "Prep ↗" button opens the panel for that lead
//   3. onApplied handler auto-creates an application entry (passed up via prop or stored locally)
//   4. Everything else identical to your original

import { useState, useEffect } from 'react'
import { ExternalLink, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import RoleActionPanel from '../components/RoleActionPanel.jsx'

const SEED_LEADS = [
  { id: 1, role_title: 'IT QA Specialist IV', company: 'Enbridge / Raise', via: 'Raise Recruiting', category: 'QA', type: 'Contract', work_model: 'Hybrid', pay_rate: '$54–57/hr W2', days_posted: 26, match_score: 95, contact_name: 'Raise Recruiting', contact_email: 'hello@raiserecruiting.com', status: 'New', apply_link: 'https://www.glassdoor.com/job-listing/it-quality-assurance-specialist-iv-houston-tx-hybrid-enbridge-JV_IC1140171_KO0,52_KE53,61.htm?jl=1010015454937' },
  { id: 2, role_title: 'Business Analyst III', company: 'TEKsystems', via: 'TEKsystems', category: 'BA', type: 'Contract', work_model: 'Hybrid', pay_rate: 'TBD', days_posted: 150, match_score: 92, contact_name: 'Kape Kelly', contact_email: 'PatrKelly@teksystems.com', status: 'New', apply_link: 'https://careers.teksystems.com/us/en/job/JP-005705306/Houston-Business-Analyst-III' },
  { id: 3, role_title: 'Sr. BA — Customer Comms', company: 'TEKsystems (FSI)', via: 'TEKsystems', category: 'BA', type: 'Contract', work_model: 'Remote', pay_rate: 'TBD', days_posted: 7, match_score: 91, contact_name: 'Kape Kelly', contact_email: 'PatrKelly@teksystems.com', status: 'New', apply_link: 'https://careers.teksystems.com/us/en' },
  { id: 4, role_title: 'Senior QA Analyst', company: 'Tekmetric', via: 'Direct', category: 'QA', type: 'Full-Time', work_model: 'Hybrid', pay_rate: '$42–54/hr', days_posted: 145, match_score: 90, contact_name: 'Tekmetric Talent', contact_email: '', status: 'New', apply_link: 'https://job-boards.greenhouse.io/tekmetric/jobs/5796593004' },
  { id: 5, role_title: 'Appian QA Tester', company: 'KBR', via: 'Direct', category: 'QA', type: 'Full-Time', work_model: 'On-site', pay_rate: 'TBD', days_posted: 52, match_score: 88, contact_name: 'KBR Talent', contact_email: '', status: 'New', apply_link: 'https://kbr.wd5.myworkdayjobs.com/en-US/kbr_careers/job/Houston-Texas/Appian-Software-QA-Tester_R2119912' },
  { id: 6, role_title: 'Sr. Agile Scrum Master', company: 'CrowdPlat', via: 'LinkedIn', category: 'PM', type: 'Contract', work_model: 'Remote', pay_rate: 'TBD', days_posted: 14, match_score: 85, contact_name: 'CrowdPlat Recruiting', contact_email: '', status: 'New', apply_link: 'https://www.linkedin.com/jobs/view/4402322679' },
  { id: 7, role_title: 'QA Analyst / BA', company: 'Grenza Inc.', via: 'Indeed', category: 'QA', type: 'Contract', work_model: 'On-site', pay_rate: 'TBD', days_posted: 30, match_score: 80, contact_name: 'Grenza HR', contact_email: '', status: 'New', apply_link: 'https://www.indeed.com/q-grenza-l-houston,-tx-jobs.html' },
  { id: 8, role_title: 'QA Testing Analyst', company: 'ESP Enterprises', via: 'Indeed', category: 'QA', type: 'Contract', work_model: 'On-site', pay_rate: 'TBD', days_posted: 21, match_score: 78, contact_name: 'ESP HR', contact_email: '', status: 'New', apply_link: 'https://www.indeed.com/cmp/Esp-Enterprises,-Inc./jobs/l-Houston,-TX' },
]

const STATUS_OPTIONS = ['New', 'Reviewing', 'Applied', 'Passed', 'Closed']

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <ChevronsUpDown size={10} style={{ opacity: 0.3 }} />
  return sortDir === 'desc' ? <ChevronDown size={10} /> : <ChevronUp size={10} />
}

function scoreColor(s) { return s >= 90 ? 'var(--success)' : s >= 80 ? 'var(--warn)' : 'var(--text3)' }
function scoreBg(s) { return s >= 90 ? 'var(--success)' : s >= 80 ? 'var(--warn)' : 'var(--text3)' }

export default function LeadsPage({ onApplicationLogged, agentLeads = [] }) {
  const [leads, setLeads] = useState(() => {
    // Merge seed + any agent leads already in state
    return SEED_LEADS
  })
  const [search, setSearch] = useState('')
  const [fType, setFType] = useState('')
  const [fModel, setFModel] = useState('')
  const [fRole, setFRole] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [sortCol, setSortCol] = useState('match_score')
  const [sortDir, setSortDir] = useState('desc')
  const [activeRole, setActiveRole] = useState(null)

  // Merge new leads from agents when they arrive
  useEffect(() => {
    if (!agentLeads.length) return
    setLeads(prev => {
      const ids = new Set(prev.map(l => l.id))
      return [...prev, ...agentLeads.filter(l => !ids.has(l.id))]
    })
  }, [agentLeads])   // ← NEW

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortCol(col); setSortDir('desc') }
  }

  const updateStatus = (id, val) => {
    setLeads(leads.map(l => l.id === id ? { ...l, status: val } : l))
  }

  // Called when user clicks "Mark as Applied" in RoleActionPanel
  const handleApplied = (appData) => {
    // Update lead status to Applied
    setLeads(prev => prev.map(l => l.id === appData.id ? { ...l, status: 'Applied' } : l))
    // Bubble up to App so ApplicationsPage can receive it
    onApplicationLogged?.(appData)
    setActiveRole(null)
  }

  const filtered = leads
    .filter(l => {
      const q = search.toLowerCase()
      if (q && !l.role_title.toLowerCase().includes(q) && !l.company.toLowerCase().includes(q)) return false
      if (fType && l.type !== fType) return false
      if (fModel && l.work_model !== fModel) return false
      if (fRole && l.category !== fRole) return false
      if (fStatus && l.status !== fStatus) return false
      return true
    })
    .sort((a, b) => {
      const av = a[sortCol] ?? ''
      const bv = b[sortCol] ?? ''
      const mul = sortDir === 'desc' ? -1 : 1
      return av < bv ? mul : av > bv ? -mul : 0
    })

  const newCount = leads.filter(l => l.status === 'New').length
  const remoteCount = leads.filter(l => l.work_model === 'Remote').length
  const appliedCount = leads.filter(l => l.status === 'Applied').length
  const avg = Math.round(leads.reduce((s, l) => s + l.match_score, 0) / leads.length)

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Job Leads</div>
        <div className="page-sub">Live leads from Agent 1 + Agent 2 · Last run: May 3, 2026</div>
      </div>

      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="stat-card accent"><div className="s-label">Total</div><div className="s-val">{leads.length}</div></div>
        <div className="stat-card"><div className="s-label">New</div><div className="s-val">{newCount}</div></div>
        <div className="stat-card"><div className="s-label">Applied</div><div className="s-val">{appliedCount}</div></div>
        <div className="stat-card"><div className="s-label">Remote</div><div className="s-val">{remoteCount}</div></div>
        <div className="stat-card"><div className="s-label">Avg Match</div><div className="s-val">{avg}%</div></div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <input type="text" placeholder="Search role, company..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 180 }} />
          <select value={fType} onChange={e => setFType(e.target.value)}>
            <option value="">All types</option>
            <option>Contract</option>
            <option>Full-Time</option>
            <option>Contract-to-Hire</option>
          </select>
          <select value={fModel} onChange={e => setFModel(e.target.value)}>
            <option value="">All locations</option>
            <option>Remote</option>
            <option>Hybrid</option>
            <option>On-site</option>
          </select>
          <select value={fRole} onChange={e => setFRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="QA">QA / Testing</option>
            <option value="BA">Business Analyst</option>
            <option value="PM">PM / Agile</option>
          </select>
          <select value={fStatus} onChange={e => setFStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn" onClick={() => { setSearch(''); setFType(''); setFModel(''); setFRole(''); setFStatus('') }}>Clear</button>
        <button className="btn btn-accent">Run agent ↗</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {[
                ['role_title', 'Role', 160],
                ['company', 'Company', 110],
                ['category', 'Cat', 54],
                ['type', 'Type', 90],
                ['work_model', 'Location', 76],
                ['pay_rate', 'Pay', 96],
                ['days_posted', 'Age', 52],
                ['match_score', 'Match', 90],
                ['contact_name', 'Contact', 130],
                [null, 'Status', 96],
                [null, 'Actions', 120],
              ].map(([col, label, width]) => (
                <th key={label} style={{ width }} onClick={col ? () => handleSort(col) : undefined}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {label}
                    {col && <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={11} className="empty">No leads match your filters.</td></tr>
            )}
            {filtered.map(l => (
              <tr key={l.id}>
                <td style={{ fontWeight: 500, color: 'var(--text)' }}>{l.role_title}</td>
                <td style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{l.company}</td>
                <td><span className={`pill pill-${l.category.toLowerCase()}`}>{l.category}</span></td>
                <td><span className={`pill pill-${l.type === 'Contract' ? 'contract' : l.type === 'Full-Time' ? 'ft' : 'cth'}`}>{l.type}</span></td>
                <td><span className={`pill pill-${l.work_model.toLowerCase().replace('-', '')}`}>{l.work_model}</span></td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)' }}>{l.pay_rate}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: l.days_posted <= 7 ? 'var(--success)' : l.days_posted > 30 ? 'var(--warn)' : 'var(--text2)' }}>{l.days_posted}d</td>
                <td>
                  <div className="score-bar">
                    <div className="bar-bg"><div className="bar-fill" style={{ width: `${l.match_score}%`, background: scoreBg(l.match_score) }} /></div>
                    <span className="score-num" style={{ color: scoreColor(l.match_score) }}>{l.match_score}</span>
                  </div>
                </td>
                <td style={{ fontSize: 11 }}>
                  <div style={{ fontWeight: 500, color: 'var(--text)' }}>{l.contact_name}</div>
                  {l.contact_email && <div style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>{l.contact_email}</div>}
                </td>
                <td>
                  <select className="status-sel" value={l.status} onChange={e => updateStatus(l.id, e.target.value)}>
                    {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {/* UPDATED: opens RoleActionPanel */}
                    <button className="btn btn-sm btn-accent" onClick={() => setActiveRole(l)}>Prep ↗</button>
                    <a href={l.apply_link} target="_blank" rel="noopener noreferrer">
                      <button className="btn btn-sm"><ExternalLink size={10} /></button>
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Action Panel — renders when a lead is selected */}
      {activeRole && (
        <RoleActionPanel
          role={activeRole}
          onClose={() => setActiveRole(null)}
          onApplied={handleApplied}
        />
      )}
    </div>
  )
}
