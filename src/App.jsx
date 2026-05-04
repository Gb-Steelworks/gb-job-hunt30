// App.jsx — UPDATED
// Changes from original:
//   1. Added ResumeVaultPage import + 'vault' nav item
//   2. Added useState for pendingApplications to bridge LeadsPage → ApplicationsPage
//   3. Passes onApplicationLogged to LeadsPage, pendingApplications to ApplicationsPage
//   4. Everything else identical to your original

import { useState } from 'react'
import { Briefcase, Building2, Linkedin, BarChart2, Bot, ListChecks, FileText } from 'lucide-react'
import LeadsPage from './pages/LeadsPage.jsx'
import CompaniesPage from './pages/CompaniesPage.jsx'
import LinkedInPage from './pages/LinkedInPage.jsx'
import ApplicationsPage from './pages/ApplicationsPage.jsx'
import AgentsPage from './pages/AgentsPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ResumeVaultPage from './pages/ResumeVaultPage.jsx'   // ← NEW

const DAYS_LEFT = Math.max(0, Math.ceil((new Date('2026-05-31') - new Date()) / (1000 * 60 * 60 * 24)))

const NAV = [
  { id: 'dashboard',    label: 'Dashboard',    icon: BarChart2,  section: 'Overview' },
  { id: 'leads',        label: 'Job Leads',    icon: Briefcase,  count: 8, section: 'Search' },
  { id: 'applications', label: 'Applications', icon: ListChecks, count: 0 },
  { id: 'companies',    label: 'Companies',    icon: Building2,  count: 5 },
  { id: 'linkedin',     label: 'LinkedIn',     icon: Linkedin,   section: 'Network' },
  { id: 'agents',       label: 'Agents',       icon: Bot,        section: 'Automation' },
  { id: 'vault',        label: 'Resume Vault', icon: FileText,   section: 'Prep' },  // ← NEW
]

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [pendingApps, setPendingApps] = useState([])   // ← NEW: bridge from LeadsPage

  // Called by LeadsPage when user marks a role as Applied via RoleActionPanel
  const handleApplicationLogged = (appData) => {
    setPendingApps(prev => {
      const exists = prev.find(a => a.id === appData.id)
      return exists ? prev : [...prev, appData]
    })
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':    return <DashboardPage onNavigate={setPage} />
      case 'leads':        return <LeadsPage onApplicationLogged={handleApplicationLogged} />
      case 'applications': return <ApplicationsPage pendingApplications={pendingApps} />
      case 'companies':    return <CompaniesPage />
      case 'linkedin':     return <LinkedInPage />
      case 'agents':       return <AgentsPage />
      case 'vault':        return <ResumeVaultPage />   // ← NEW
      default:             return <DashboardPage onNavigate={setPage} />
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
          <div className="until">days until May 31</div>
        </div>
        <nav className="nav">
          {NAV.map(item => {
            const showSection = item.section && item.section !== lastSection
            if (showSection) lastSection = item.section
            // Show live count badge for applications
            const count = item.id === 'applications' ? pendingApps.length : item.count
            return (
              <div key={item.id}>
                {showSection && <div className="nav-section">{item.section}</div>}
                <button
                  className={`nav-item ${page === item.id ? 'active' : ''}`}
                  onClick={() => setPage(item.id)}
                >
                  <item.icon className="icon" size={14} />
                  {item.label}
                  {count !== undefined && (
                    <span className="nav-count">{count}</span>
                  )}
                </button>
              </div>
            )
          })}
        </nav>
        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            v1.1 · Built with Claude
          </div>
        </div>
      </aside>
      <main className="main">
        {renderPage()}
      </main>
    </div>
  )
}
