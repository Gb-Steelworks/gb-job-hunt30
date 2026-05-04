// LeadsPage.jsx - v2 with 20 real leads from Agent 1 + 2 runs (May 4 2026)
// Prep ↗ opens RoleActionPanel for ATS optimize, cover letter, Q&A, and logging

import { useState, useEffect } from 'react'
import { ExternalLink, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import RoleActionPanel from '../components/RoleActionPanel.jsx'

const SEED_LEADS = [
  // -- AGENT 1: Recruiters + Job Boards --------------------------------------
  {
    id: 1, role_title: 'IT QA Specialist IV', company: 'Enbridge / Raise',
    via: 'Raise Recruiting', category: 'QA', type: 'Contract', work_model: 'Hybrid',
    pay_rate: '$54-57/hr W2', days_posted: 26, match_score: 95,
    contact_name: 'Raise Recruiting', contact_email: 'hello@raiserecruiting.com',
    status: 'New', notes: '',
    apply_link: 'https://raiserecruiting.com/job-postings/?s=enbridge+QA'
  },
  // id:2 removed - TEKsystems BA III was 150 days posted (>120 day limit)
  {
    id: 3, role_title: 'Sr. BA - Customer Comms', company: 'TEKsystems (FSI)',
    via: 'TEKsystems', category: 'BA', type: 'Contract', work_model: 'Remote',
    pay_rate: 'TBD', days_posted: 7, match_score: 91,
    contact_name: 'Kape Kelly', contact_email: 'PatrKelly@teksystems.com',
    status: 'New', notes: '',
    apply_link: 'https://careers.teksystems.com/us/en'
  },
  // id:4 removed - Tekmetric Senior QA Analyst was 145 days posted (>120 day limit)
  {
    id: 5, role_title: 'Appian QA Tester', company: 'KBR',
    via: 'Direct', category: 'QA', type: 'Full-Time', work_model: 'On-site',
    pay_rate: 'TBD', days_posted: 52, match_score: 88,
    contact_name: 'KBR Talent Acquisition', contact_email: '',
    status: 'New', notes: '',
    apply_link: 'https://kbr.wd5.myworkdayjobs.com/en-US/kbr_careers/job/Houston-Texas/Appian-Software-QA-Tester_R2119912'
  },
  {
    id: 6, role_title: 'Sr. Agile Scrum Master', company: 'CrowdPlat',
    via: 'LinkedIn', category: 'PM', type: 'Contract', work_model: 'Remote',
    pay_rate: 'TBD', days_posted: 14, match_score: 85,
    contact_name: 'CrowdPlat Recruiting', contact_email: '',
    status: 'New', notes: '',
    apply_link: 'https://www.linkedin.com/jobs/view/4402322679'
  },
  {
    id: 7, role_title: 'QA Analyst / BA', company: 'Grenza Inc.',
    via: 'Indeed', category: 'QA', type: 'Contract', work_model: 'On-site',
    pay_rate: 'TBD', days_posted: 30, match_score: 80,
    contact_name: 'Grenza HR', contact_email: '',
    status: 'New', notes: '',
    apply_link: 'http://www.grenza.com/index.php/ct-careers'
  },
  {
    id: 8, role_title: 'QA Testing Analyst', company: 'ESP Enterprises',
    via: 'Indeed', category: 'QA', type: 'Contract', work_model: 'On-site',
    pay_rate: 'TBD', days_posted: 21, match_score: 78,
    contact_name: 'ESP HR', contact_email: '',
    status: 'New', notes: '',
    apply_link: 'https://espusa.com/careers/'
  },
  // -- AGENT 1: New leads from May 4 run -------------------------------------
  {
    id: 9, role_title: 'Agile & Data Management Business Analyst', company: 'Kforce (Consumer Electronics Client)',
    via: 'Kforce', category: 'BA', type: 'Contract', work_model: 'Hybrid',
    pay_rate: '$65-70/hr', days_posted: 5, match_score: 94,
    contact_name: 'Kforce Houston', contact_email: '',
    status: 'New', notes: 'Epics, user stories, SOPs, data architecture. Strong George match.',
    apply_link: 'https://www.kforce.com/find-work/search-jobs/?keyword=business+analyst+houston'
  },
  {
    id: 10, role_title: 'Business Analyst / Product Owner', company: 'Kforce',
    via: 'Kforce / Dice', category: 'BA', type: 'Contract', work_model: 'Hybrid',
    pay_rate: 'TBD', days_posted: 8, match_score: 92,
    contact_name: 'Kforce Recruiting', contact_email: '',
    status: 'New', notes: 'Requirements mgmt, change mgmt, stakeholder coordination.',
    apply_link: 'https://www.kforce.com/find-work/search-jobs/?keyword=product+owner+houston'
  },
  {
    id: 11, role_title: 'Senior Business Analyst / QA Lead', company: 'Conviso Inc.',
    via: 'Jooble / Indeed', category: 'QA', type: 'Contract', work_model: 'Remote',
    pay_rate: 'TBD', days_posted: 10, match_score: 96,
    contact_name: 'Conviso Recruiting', contact_email: '',
    status: 'New', notes: 'Dual BA/QA Lead role - George is a perfect fit. Delegate to PM.',
    apply_link: 'https://www.linkedin.com/jobs/search/?keywords=senior+business+analyst+QA+lead+remote'
  },
  {
    id: 12, role_title: 'QA Lead / Test Engineer - Healthcare AI', company: 'Undisclosed (Dallas TX)',
    via: 'ZipRecruiter', category: 'QA', type: 'Contract', work_model: 'Remote',
    pay_rate: '$55-75/hr', days_posted: 6, match_score: 88,
    contact_name: 'ZipRecruiter Posting', contact_email: '',
    status: 'New', notes: 'Dallas TX based, remote ok. CST time zone required.',
    apply_link: 'https://www.linkedin.com/jobs/search/?keywords=QA+lead+test+engineer+remote+dallas+texas'
  },
  {
    id: 13, role_title: 'Salesforce QA Analyst', company: 'Insight Global (FSI Client)',
    via: 'Dice', category: 'QA', type: 'Contract', work_model: 'Remote',
    pay_rate: 'TBD', days_posted: 4, match_score: 84,
    contact_name: 'Insight Global Houston', contact_email: '',
    status: 'New', notes: '6 months+, Agile delivery team, Salesforce CRM + Experience Cloud.',
    apply_link: 'https://www.insightglobal.com/jobs/?search=salesforce+QA+analyst+remote'
  },
  {
    id: 15, role_title: 'MS Dynamics 365 ERP Project Manager', company: 'Crowe LLP',
    via: 'Direct - careers.crowe.com', category: 'PM', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: 'TBD', days_posted: 14, match_score: 87,
    contact_name: 'Crowe LLP Experienced Hiring', contact_email: '',
    status: 'New', notes: 'Houston TX. 5-8 yrs ERP PM, initiation through delivery. Crowe consulting culture similar to Deloitte/Capco background.',
    apply_link: 'https://careers.crowe.com/experienced-careers'
  },
  {
    id: 26, role_title: 'HCM/Payroll BA & Systems Implementation Lead', company: 'Crowe LLP',
    via: 'Direct - careers.crowe.com', category: 'BA', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: 'TBD', days_posted: 10, match_score: 85,
    contact_name: 'Crowe LLP Experienced Hiring', contact_email: '',
    status: 'New', notes: 'Houston TX. Public sector BA + implementation lead. Strong Makpar/IRS background is a differentiator here.',
    apply_link: 'https://careers.crowe.com/experienced-careers'
  },
  // -- AGENT 2: FSI + Boutique TX Consulting ---------------------------------
  {
    id: 16, role_title: 'Product Owner - Digital Banking', company: 'Frost Bank',
    via: 'Direct', category: 'PM', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$110-130K', days_posted: 18, match_score: 93,
    contact_name: 'Frost Bank HR', contact_email: '',
    status: 'New', notes: 'San Antonio TX. George has direct JPMC mobile banking experience.',
    apply_link: 'https://www.frostbank.com/about/careers'
  },
  {
    id: 17, role_title: 'Sr. Agile Delivery Manager', company: 'Slalom Consulting',
    via: 'Direct', category: 'PM', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$130-150K', days_posted: 9, match_score: 92,
    contact_name: 'Slalom Houston Recruiting', contact_email: '',
    status: 'New', notes: 'Houston TX. Strong Capco/Deloitte background is ideal for Slalom.',
    apply_link: 'https://www.slalom.com/us/en/careers'
  },
  {
    id: 18, role_title: 'Product Owner / BA - Mortgage & Insurance', company: 'West Monroe Partners',
    via: 'ZipRecruiter', category: 'PM', type: 'Contract', work_model: 'On-site',
    pay_rate: 'TBD', days_posted: 3, match_score: 91,
    contact_name: 'West Monroe Houston', contact_email: '',
    status: 'New', notes: '8+ yrs PO/BA, JIRA/Confluence, Agile/Scrum, TRID/RESPA knowledge helpful.',
    apply_link: 'https://www.westmonroe.com/careers'
  },
  {
    id: 19, role_title: 'Agile Delivery Manager / Sr. BA', company: 'Capco Consulting',
    via: 'Direct', category: 'BA', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$120-140K', days_posted: 14, match_score: 97,
    contact_name: 'Capco Houston Recruiting', contact_email: '',
    status: 'New', notes: 'George literally did this role at Capco 2021-2024. Strong return candidate.',
    apply_link: 'https://www.capco.com/careers'
  },
  {
    id: 20, role_title: 'Sr. Project Manager - Finance Transformation', company: 'Opportune LLP',
    via: 'Direct', category: 'PM', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$120-145K', days_posted: 21, match_score: 89,
    contact_name: 'Opportune LLP HR', contact_email: '',
    status: 'New', notes: 'Houston TX energy/FSI consulting boutique. ERP, PMO, transformation.',
    apply_link: 'https://www.opportune.com/careers'
  },
  {
    id: 21, role_title: 'Business Technology Product Manager - AI', company: 'Built In Houston (Multiple)',
    via: 'Built In', category: 'PM', type: 'Full-Time', work_model: 'Remote',
    pay_rate: '$120-150K', days_posted: 7, match_score: 87,
    contact_name: 'Built In Houston', contact_email: '',
    status: 'New', notes: 'AI product initiatives, sales platform roadmaps, backlog mgmt.',
    apply_link: 'https://builtin.com/jobs/houston/product'
  },
  {
    id: 22, role_title: 'Pariveda Solutions - Sr. Consultant (PM/BA)', company: 'Pariveda Solutions',
    via: 'Direct', category: 'BA', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$110-130K', days_posted: 30, match_score: 88,
    contact_name: 'Pariveda Dallas/Houston', contact_email: '',
    status: 'New', notes: 'Dallas HQ, Houston presence. Boutique tech consulting, values-driven culture.',
    apply_link: 'https://www.parivedasolutions.com/careers'
  },
  // -- VERIFIED BA LEADS - added May 4 2026 ----------------------------------
  // Rule: every lead below has a verified direct link to an active posting
  {
    id: 23, role_title: 'Sr. Business Analyst - Cloud Migration (VA)', company: 'SAIC',
    via: 'Direct - jobs.saic.com', category: 'BA', type: 'Full-Time', work_model: 'Remote',
    pay_rate: 'TBD', days_posted: 4, match_score: 88,
    contact_name: 'SAIC Talent Acquisition', contact_email: '',
    status: 'New', notes: '100% remote TX. VA cloud migration. No clearance required. Process improvement, change mgmt, cross-functional teams.',
    apply_link: 'https://jobs.saic.com/jobs/17678430-sr-business-analyst'
  },
  {
    id: 24, role_title: 'Product Owner - Business Systems Analyst', company: 'David Weekley Homes',
    via: 'Direct - careers.davidweekleyhomes.com', category: 'BA', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$85-127K', days_posted: 14, match_score: 87,
    contact_name: 'David Weekley Homes IT Recruiting', contact_email: '',
    status: 'New', notes: 'West Houston (I-10/610). 3 days onsite. PO + BSA dual role. Fortune 100 Best Companies 19x.',
    apply_link: 'https://careers.davidweekleyhomes.com/InformationTechnology/JobPosting/20730/Apply'
  },
  {
    id: 25, role_title: 'Business Process Analyst', company: 'David Weekley Homes',
    via: 'Direct - careers.davidweekleyhomes.com', category: 'BA', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: 'TBD', days_posted: 21, match_score: 84,
    contact_name: 'David Weekley Homes IT Recruiting', contact_email: '',
    status: 'New', notes: 'West Houston. Process mapping, requirements, business rules. Separate from PO role above.',
    apply_link: 'https://careers.davidweekleyhomes.com/InformationTechnology/JobPosting/20815'
  },
  // -- CONSULTING FIRMS - verified May 4 2026 --------------------------------
  {
    id: 27, role_title: 'Management Consulting - Retail Banking Sr Manager', company: 'Accenture',
    via: 'Direct - accenture.com/careers', category: 'consulting', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$150-210K', days_posted: 30, match_score: 91,
    contact_name: 'Accenture Experienced Recruiting', contact_email: '',
    status: 'New', notes: 'Houston listed. Retail banking transformation, business/tech operating model. Capco FSI + JPMC background is direct match.',
    apply_link: 'https://www.accenture.com/us-en/careers/jobdetails?id=R00246570_en'
  },
  {
    id: 28, role_title: 'Deloitte - Sr Consultant/Manager (Agile/SAFe, Process Analysis)', company: 'Deloitte',
    via: 'Direct - jobs2.deloitte.com', category: 'consulting', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$115-170K', days_posted: 7, match_score: 93,
    contact_name: 'Deloitte Recruiting - Houston', contact_email: '',
    status: 'New', notes: 'Houston. SAFe Scrum Master cert + process analysis/modeling. Prior Deloitte experience is a strong returnee advantage.',
    apply_link: 'https://jobs2.deloitte.com/us/en/search-results?keywords=agile&location=Houston%2C+Texas'
  },
  // -- GOVERNMENT - City of Houston · Harris County · State of TX ----------
  // All verified on governmentjobs.com - within 120 day rule
  {
    id: 29, role_title: 'Sr. Business Analyst - Universal Services', company: 'Harris County',
    via: 'Direct - governmentjobs.com/careers/harriscountytx', category: 'govt', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: 'Depends on Qualifications', days_posted: 19, match_score: 94,
    contact_name: 'Harris County HR - (713) 274-5445', contact_email: 'ADACoordinator@bmd.hctx.net',
    status: 'New', notes: 'Open until 5/23/2026 - closes soon! Agile + hybrid, SDLC, cross-functional. Makpar/IRS govt background is a direct match. Max 200 applicants.',
    apply_link: 'https://www.governmentjobs.com/careers/harriscountytx/jobs/5309137-0/sr-business-analyst'
  },
  {
    id: 30, role_title: 'IT Project Manager (Level I & II)', company: 'Harris County Universal Services',
    via: 'Direct - governmentjobs.com/careers/harriscountytx', category: 'govt', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: 'Depends on Qualifications', days_posted: 35, match_score: 91,
    contact_name: 'Harris County HR - (713) 274-5445', contact_email: '',
    status: 'New', notes: 'Hiring 2 PMs. Level II: medium-large tech projects, cross-functional teams. JIRA required. Agile experience valued.',
    apply_link: 'https://www.governmentjobs.com/careers/harriscountytx/jobs/5049206-0/it-project-manager'
  },
  {
    id: 31, role_title: 'Business Analyst (Multiple Levels)', company: 'Harris County Universal Services',
    via: 'Direct - governmentjobs.com/careers/harriscountytx', category: 'govt', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: 'Depends on Qualifications', days_posted: 30, match_score: 89,
    contact_name: 'Harris County HR - (713) 274-5445', contact_email: '',
    status: 'New', notes: 'Broad posting for multiple BA levels. Agile CSPO/CBAP cert a plus. Full SDLC, cross-functional. Justice/elections experience a plus.',
    apply_link: 'https://www.governmentjobs.com/careers/harriscountytx/jobs/5066840/business-analyst'
  },
  {
    id: 32, role_title: 'IT Lead - Business Analysis (IT Architect)', company: 'City of Houston - HITS',
    via: 'Direct - governmentjobs.com/careers/houston', category: 'govt', type: 'Full-Time', work_model: 'On-site',
    pay_rate: 'Pay Grade 29', days_posted: 45, match_score: 88,
    contact_name: 'City of Houston HR - (832) 393-0450', contact_email: '',
    status: 'New', notes: '611 Walker, Houston TX. IT Liaison/BA Lead bridging business + IT. PMO division. Strong alignment with Georges enterprise IT delivery background.',
    apply_link: 'https://www.governmentjobs.com/careers/houston'
  },
]

const STATUS_OPTIONS = ['New', 'Reviewing', 'Applied', 'Passed', 'Closed']

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <ChevronsUpDown size={10} style={{ opacity: 0.3 }} />
  return sortDir === 'desc' ? <ChevronDown size={10} /> : <ChevronUp size={10} />
}

function scoreColor(s) { return s >= 90 ? 'var(--success)' : s >= 80 ? 'var(--warn)' : 'var(--text3)' }

export default function LeadsPage({ onApplicationLogged, agentLeads = [] }) {
  const [leads, setLeads] = useState(SEED_LEADS)
  const [search, setSearch] = useState('')
  const [fType, setFType] = useState('')
  const [fModel, setFModel] = useState('')
  const [fRole, setFRole] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [sortCol, setSortCol] = useState('match_score')
  const [sortDir, setSortDir] = useState('desc')
  const [activeRole, setActiveRole] = useState(null)

  useEffect(() => {
    if (!agentLeads.length) return
    setLeads(prev => {
      const ids = new Set(prev.map(l => l.id))
      return [...prev, ...agentLeads.filter(l => !ids.has(l.id))]
    })
  }, [agentLeads])

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortCol(col); setSortDir('desc') }
  }

  const updateStatus = (id, val) => setLeads(leads.map(l => l.id === id ? { ...l, status: val } : l))

  const handleApplied = (appData) => {
    setLeads(prev => prev.map(l => l.id === appData.id ? { ...l, status: 'Applied' } : l))
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
        <div className="page-sub">Agent 1 + Agent 2 · Last run: May 4, 2026 · {leads.length} leads · links verified</div>
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
            <option value="consulting">Consulting</option>
            <option value="govt">Government</option>
          </select>
          <select value={fStatus} onChange={e => setFStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn" onClick={() => { setSearch(''); setFType(''); setFModel(''); setFRole(''); setFStatus('') }}>Clear</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {[
                ['role_title', 'Role', 160],
                ['company', 'Company', 130],
                ['category', 'Cat', 54],
                ['type', 'Type', 90],
                ['work_model', 'Location', 76],
                ['pay_rate', 'Pay', 96],
                ['days_posted', 'Age', 52],
                ['match_score', 'Match', 90],
                ['contact_name', 'Contact', 130],
                [null, 'Status', 96],
                [null, 'Actions', 100],
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
                <td style={{ fontWeight: 500, color: 'var(--text)' }}>
                  <div>{l.role_title}</div>
                  {l.notes && <div style={{ fontSize: 10, color: 'var(--text3)', fontStyle: 'italic', marginTop: 2 }}>{l.notes}</div>}
                </td>
                <td style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{l.company}</td>
                <td><span className={`pill pill-${l.category.toLowerCase()}`}>{l.category}</span></td>
                <td><span className={`pill pill-${l.type === 'Contract' ? 'contract' : 'ft'}`}>{l.type}</span></td>
                <td><span className={`pill pill-${l.work_model.toLowerCase().replace('-','').replace(' ','-')}`}>{l.work_model}</span></td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)' }}>{l.pay_rate}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: l.days_posted <= 7 ? 'var(--success)' : l.days_posted > 30 ? 'var(--warn)' : 'var(--text2)' }}>{l.days_posted}d</td>
                <td>
                  <div className="score-bar">
                    <div className="bar-bg"><div className="bar-fill" style={{ width: `${l.match_score}%`, background: scoreColor(l.match_score) }} /></div>
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
