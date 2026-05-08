import { useState, useEffect } from 'react'
import { Briefcase, Building2, Linkedin, BarChart2, Bot, ListChecks, FileText } from 'lucide-react'
import LeadsPage from './pages/LeadsPage.jsx'
import CompaniesPage from './pages/CompaniesPage.jsx'
import LinkedInPage from './pages/LinkedInPage.jsx'
import ApplicationsPage from './pages/ApplicationsPage.jsx'
import AgentsPage from './pages/AgentsPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ResumeVaultPage from './pages/ResumeVaultPage.jsx'
import { useAppStore } from './store/useAppStore.js'

const DAYS_LEFT = Math.max(0, Math.ceil((new Date('2026-06-03') - new Date()) / (1000 * 60 * 60 * 24)))

const NAV = [
  { id: 'dashboard',    label: 'Dashboard',    icon: BarChart2,  section: 'Overview' },
  { id: 'leads',        label: 'Job Leads',    icon: Briefcase,  section: 'Search' },
  { id: 'applications', label: 'Applications', icon: ListChecks },
  { id: 'companies',    label: 'Companies',    icon: Building2,  count: 5 },
  { id: 'linkedin',     label: 'LinkedIn',     icon: Linkedin,   section: 'Network' },
  { id: 'agents',       label: 'Agents',       icon: Bot,        section: 'Automation' },
  { id: 'vault',        label: 'Resume Vault', icon: FileText,   section: 'Prep' },
]

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [companyFilter, setCompanyFilter] = useState('')
  const [, forceRender] = useState(0)

  const store = useAppStore()

  // Subscribe to store changes so nav counts update
  useEffect(() => {
    const unsub = store.subscribe()
    return unsub
  }, [])

  const handleApplicationLogged = (appData) => {
    store.logApplication(appData)
  }

  const handleLeadsFound = (newLeads) => {
    store.addLeads(newLeads)
    setPage('leads')
  }

  const handleAdvanceStage = (id) => {
    store.advanceStage(id)
    forceRender(n => n + 1)
  }

  const handleSetStatus = (id, status) => {
    store.setApplicationStatus(id, status)
    forceRender(n => n + 1)
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <DashboardPage onNavigate={setPage} />
      case 'leads':
        return (
          <LeadsPage
            onApplicationLogged={handleApplicationLogged}
            agentLeads={store.leads}
            initialCompanyFilter={companyFilter}
            onClearCompanyFilter={() => setCompanyFilter('')}
          />
        )
      case 'applications':
        return (
          <ApplicationsPage
            applications={store.applications}
            onAdvanceStage={handleAdvanceStage}
            onSetStatus={handleSetStatus}
          />
        )
      case 'companies':
        return (
          <CompaniesPage
            onNavigate={(pg, cf) => {
              if (cf) setCompanyFilter(cf)
              setPage(pg)
            }}
          />
        )
      case 'linkedin':
        return <LinkedInPage />
      case 'agents':
        return <AgentsPage onLeadsFound={handleLeadsFound} />
      case 'vault':
        return <ResumeVaultPage />
      default:
        return <DashboardPage onNavigate={setPage} />
    }
  }

  let lastSection = null

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="name">George Brooks</div>
          <div className="sub">Job Hunt HQ · 2026</div>
        </div>
        <div className="sidebar-deadline">
          <div className="label">Deadline</div>
          <div className="days">{DAYS_LEFT}</div>
          <div className="until">days until June 3</div>
        </div>
        <nav className="nav">
          {NAV.map(item => {
            const showSection = item.section && item.section !== lastSection
            if (showSection) lastSection = item.section

            // Live counts from store
            const count =
              item.id === 'applications' ? store.applications.length :
              item.id === 'leads'        ? store.leads.length || 51 :
              item.count

            return (
              <div key={item.id}>
                {showSection && <div className="nav-section">{item.section}</div>}
                <button
                  className={`nav-item ${page === item.id ? 'active' : ''}`}
                  onClick={() => setPage(item.id)}
                >
                  <item.icon className="icon" size={14} />
                  {item.label}
                  {count !== undefined && <span className="nav-count">{count}</span>}
                </button>
              </div>
            )
          })}
        </nav>
        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            v1.3 · Built with Claude
          </div>
        </div>
      </aside>
      <main className="main">
        {renderPage()}
      </main>
    </div>
  )
}
