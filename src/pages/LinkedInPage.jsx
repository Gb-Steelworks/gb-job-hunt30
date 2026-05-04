// LinkedInPage.jsx
export function LinkedInPage() {
  const RECRUITERS = [
    { name: 'Staci Wells', title: 'Senior Talent Executive', company: 'Kforce', degree: 1, why: 'Self-identifies as "HP nerd" on her profile — she works the HPE Spring TX account directly. Same account as Cole Withers. Has active pipeline.', tip: 'Email: swells@kforce.com · LinkedIn: linkedin.com/in/staci-wells-48297b7b', url: 'https://www.linkedin.com/in/staci-wells-48297b7b', color: '#0d9488', initials: 'SW' },
    { name: 'Kape Kelly', title: 'Technical Recruiter', company: 'TEKsystems', degree: 1, why: 'Has 2 active Houston roles — Business Analyst III and Sr. BA Customer Comms. Already has your contact info from prior TEKsystems interactions.', tip: 'PatrKelly@teksystems.com · 480-758-6134 · Priority: reach out today', url: 'https://www.linkedin.com/search/results/people/?keywords=Kape+Kelly+TEKsystems', color: '#1d4ed8', initials: 'KK' },
    { name: 'Raise Recruiting', title: 'IT Staffing Recruiter', company: 'Raise (Enbridge partner)', degree: 2, why: 'Placed the Enbridge IT QA Specialist IV role. Highest match score (95%) in your leads list. 48-hour application review SLA.', tip: 'hello@raiserecruiting.com · 800-567-9675 · Email first then connect on LinkedIn', url: 'https://www.linkedin.com/search/results/people/?keywords=Raise+Recruiting+Enbridge', color: '#065f46', initials: 'RR' },
  ]

  const MANAGERS = [
    { name: 'Search: Enbridge QA Manager', title: 'IT Quality / Delivery Manager', company: 'Enbridge', degree: 2, why: 'Identifying the hiring manager before your interview gives you context on team structure and what they value. Search after applying, not before.', tip: 'Search "Enbridge IT quality manager Houston" on LinkedIn', url: 'https://www.linkedin.com/search/results/people/?keywords=Enbridge+IT+quality+manager+Houston', color: '#92400e', initials: 'EQ' },
    { name: 'Search: Tekmetric VP Engineering', title: 'VP / Director of Engineering', company: 'Tekmetric', degree: 2, why: 'At a 200-person SaaS, QA Lead likely reports into Engineering. Knowing the hiring manager tells you what they value before the screen.', tip: 'Search "Tekmetric VP engineering" or "Tekmetric director engineering"', url: 'https://www.linkedin.com/search/results/people/?keywords=Tekmetric+VP+engineering', color: '#4c1d95', initials: 'TV' },
  ]

  const SECOND = [
    { name: 'Your Capco network', title: 'Former colleagues at FSI firms', company: 'Multiple', degree: 2, why: 'Your Capco colleagues (2021-2024) are now distributed across JPMC, Wells, Schwab, and other FSI firms in Texas. A warm intro from a former colleague is worth 10 cold applications.', tip: 'Filter LinkedIn 1st-degree connections by "Capco" — message anyone now at target companies', url: 'https://www.linkedin.com/search/results/people/?network=%5B%22F%22%5D&keywords=Capco+Houston', color: '#be185d', initials: 'CA' },
    { name: 'Your Deloitte network', title: 'Former colleagues — senior level', company: 'Multiple', degree: 2, why: 'Deloitte alumni (2011-2014) are now VPs, Directors, and Partners. This network is senior enough to make warm intros at FSI firms and consulting shops.', tip: 'Search 1st-degree connections filtered by "Deloitte" — focus on those at target companies', url: 'https://www.linkedin.com/search/results/people/?network=%5B%22F%22%5D&keywords=Deloitte+consulting+Houston', color: '#0c4a6e', initials: 'DA' },
    { name: 'Rice University Alumni', title: 'BSEE alumni network', company: 'Houston area', degree: 2, why: 'Rice alumni in Houston tech and FSI are an underused asset. Many are at JPMC Plano, Fidelity Westlake, and energy-adjacent tech firms.', tip: 'Also check Rice alumni portal — engineering alumni chapters have job boards', url: 'https://www.linkedin.com/search/results/people/?network=%5B%22F%22%5D&keywords=Rice+University+Houston+technology', color: '#1c1917', initials: 'RI' },
  ]

  const LiCard = ({ p }) => (
    <div className="li-card">
      <div className="li-avatar" style={{ background: p.color + '22', color: p.color }}>{p.initials}</div>
      <div className="li-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className="li-name">{p.name}</span>
          <span className={`deg-badge deg-${p.degree}`}>{p.degree === 1 ? '1st' : '2nd'}</span>
        </div>
        <div className="li-title">{p.title} · {p.company}</div>
        <div className="li-why">{p.why} <em style={{ color: 'var(--text3)' }}>Tip: {p.tip}</em></div>
        <div className="li-actions">
          <a href={p.url} target="_blank" rel="noopener noreferrer">
            <button className="btn btn-sm btn-blue">Search on LinkedIn ↗</button>
          </a>
          <button className="btn btn-sm">Draft message ↗</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">LinkedIn Connections</div>
        <div className="page-sub">Recruiters, hiring managers, and 2nd-degree contacts at target companies</div>
      </div>
      <div className="section-label">Recruiters — active on your leads</div>
      <div className="li-grid">{RECRUITERS.map(p => <LiCard key={p.name} p={p} />)}</div>
      <div className="section-label">Hiring managers — worth finding</div>
      <div className="li-grid">{MANAGERS.map(p => <LiCard key={p.name} p={p} />)}</div>
      <div className="section-label">2nd-degree network — warm intro potential</div>
      <div className="li-grid">{SECOND.map(p => <LiCard key={p.name} p={p} />)}</div>
    </div>
  )
}

export default LinkedInPage
