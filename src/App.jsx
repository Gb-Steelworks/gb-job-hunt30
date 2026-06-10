// App.jsx — fixed
// Adds shared leads + applications state so all pages stay in sync
// Fixes: View All button, agent leads persisting, application counts, deadline

import { useState } from 'react'
import { loadApplications, saveApplications, upsertApplication, loadAgentLeads, mergeAgentLeads, loadLeadStatuses, saveLeadStatus } from './store/appStore.js'
import DashboardPage from './pages/DashboardPage'
import LeadsPage from './pages/LeadsPage'
import ApplicationsPage from './pages/ApplicationsPage'
import CompaniesPage from './pages/CompaniesPage'
import LinkedInPage from './pages/LinkedInPage'
import AgentsPage from './pages/AgentsPage'
import ResumeVaultPage from './pages/ResumeVaultPage'
import ExportPage from './pages/ExportPage'

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: '⬛' },
  { id: 'leads',        label: 'Job Leads',    icon: '🔍' },
  { id: 'applications', label: 'Applications', icon: '📋' },
  { id: 'companies',    label: 'Companies',    icon: '🏢' },
  { id: 'linkedin',     label: 'LinkedIn',     icon: '🔗' },
  { id: 'agents',       label: 'Agents',       icon: '🤖' },
  { id: 'vault',        label: 'Resume Vault', icon: '📁' },
  { id: 'export',       label: 'Export',       icon: '💾' },
]

export default function App() {
  const [page,         setPage]         = useState('dashboard')
  const [menuOpen,     setMenuOpen]     = useState(false)
  // ── Shared state ────────────────────────────────────────────────────────────
  const [agentLeads,   setAgentLeads]   = useState(() => loadAgentLeads())
  const [applications, setApplications] = useState(() => loadApplications())
  const [leadStatuses, setLeadStatuses] = useState(() => loadLeadStatuses())
  const [extraPatterns,setExtraPatterns]= useState([])   // role patterns from + Add Lead

  // Called by AgentsPage when a run completes — merges new leads into agentLeads
  const handleLeadsFound = (newLeads) => {
    const merged = mergeAgentLeads(newLeads)
    setAgentLeads(merged)
  }

  // Called by LeadsPage/RoleActionPanel when user logs an application
  const handleApplicationLogged = (appData) => {
    const updated = upsertApplication(appData)
    setApplications(updated)
  }

  // Called by ApplicationsPage when status advances
  // Handles both status changes and field edits from ApplicationsPage
  // When called from stage buttons: onSetStatus(id, status)
  // When called from edit form:     onSetStatus(id, status, { role_title, job_id, apply_link })
  const handleAdvanceStage = (id, newStatus, fieldUpdates = {}) => {
    setApplications(prev => {
      const updated = prev.map(a =>
        a.id === id ? { ...a, status: newStatus, ...fieldUpdates } : a
      )
      saveApplications(updated)
      return updated
    })
  }

  // Called from Dashboard or LeadsPage when a lead status changes
  const handleLeadStatusChange = (id, newStatus) => {
    saveLeadStatus(id, newStatus)
    setLeadStatuses(prev => ({ ...prev, [id]: newStatus }))
  }

  // Called by LeadsPage + Add Lead modal to feed agent context
  const handleNewRolePattern = (pattern) => {
    setExtraPatterns(prev => [...prev, pattern])
  }

  function navigate(id) {
    setPage(id)
    setMenuOpen(false)
  }

  // ── Render correct page with all its props ──────────────────────────────────
  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={navigate}
            leads={agentLeads}
            applications={applications}
            leadStatuses={leadStatuses}
            onLeadStatusChange={handleLeadStatusChange}
          />
        )
      case 'leads':
        return (
          <LeadsPage
            onApplicationLogged={handleApplicationLogged}
            agentLeads={agentLeads}
            onNewRolePattern={handleNewRolePattern}
          />
        )
      case 'applications':
        return (
          <ApplicationsPage
            applications={applications}
            onAdvanceStage={handleAdvanceStage}
            onSetStatus={handleAdvanceStage}
          />
        )
      case 'companies':
        return <CompaniesPage onNavigate={navigate} />
      case 'linkedin':
        return <LinkedInPage />
      case 'agents':
        return (
          <AgentsPage
            onLeadsFound={handleLeadsFound}
            extraPatterns={extraPatterns}
          />
        )
      case 'vault':
        return <ResumeVaultPage />
      case 'export':
        return <ExportPage />
      default:
        return (
          <DashboardPage
            onNavigate={navigate}
            leads={agentLeads}
            applications={applications}
            leadStatuses={leadStatuses}
            onLeadStatusChange={handleLeadStatusChange}
          />
        )
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Overlay — mobile only */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            zIndex: 40, display: 'none'
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar nav */}
      <nav
        className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}
        style={{
          width: 220, minHeight: '100vh', background: 'var(--surface)',
          borderRight: '1px solid var(--border)', padding: '1rem 0',
          display: 'flex', flexDirection: 'column', gap: 2,
          position: 'sticky', top: 0, flexShrink: 0,
        }}
      >
        <div style={{ padding: '0 1rem 1rem', fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>
          Job Hunt 30
        </div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 1rem', background: page === item.id ? 'var(--accent-faint)' : 'transparent',
              border: 'none', borderLeft: page === item.id ? '3px solid var(--accent)' : '3px solid transparent',
              color: page === item.id ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: 14, cursor: 'pointer', textAlign: 'left', width: '100%',
            }}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0 }}>

        {/* Mobile top bar */}
        <div
          className="mobile-topbar"
          style={{
            display: 'none', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            background: 'var(--surface)',
          }}
        >
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Open menu"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 22, color: 'var(--text)', padding: 0, lineHeight: 1,
            }}
          >
            ☰
          </button>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>
            {NAV_ITEMS.find(n => n.id === page)?.label || 'Job Hunt 30'}
          </span>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {renderPage()}
        </div>
      </main>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            top: 0; left: 0; bottom: 0;
            z-index: 50;
            transform: translateX(-100%);
            transition: transform 0.22s ease;
          }
          .sidebar-open {
            transform: translateX(0) !important;
          }
          .mobile-overlay {
            display: block !important;
          }
          .mobile-topbar {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  )
}
