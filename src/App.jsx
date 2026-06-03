// App.jsx — drop-in replacement
// Adds: hamburger menu button on mobile, overlay dismiss, nav closes on page select

import { useState } from 'react'
import DashboardPage from './pages/DashboardPage'
import LeadsPage from './pages/LeadsPage'
import ApplicationsPage from './pages/ApplicationsPage'
import CompaniesPage from './pages/CompaniesPage'
import LinkedInPage from './pages/LinkedInPage'
import AgentsPage from './pages/AgentsPage'
import ResumeVaultPage from './pages/ResumeVaultPage'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⬛' },
  { id: 'leads', label: 'Job Leads', icon: '🔍' },
  { id: 'applications', label: 'Applications', icon: '📋' },
  { id: 'companies', label: 'Companies', icon: '🏢' },
  { id: 'linkedin', label: 'LinkedIn', icon: '🔗' },
  { id: 'agents', label: 'Agents', icon: '🤖' },
  { id: 'vault', label: 'Resume Vault', icon: '📁' },
]

const PAGE_MAP = {
  dashboard: DashboardPage,
  leads: LeadsPage,
  applications: ApplicationsPage,
  companies: CompaniesPage,
  linkedin: LinkedInPage,
  agents: AgentsPage,
  vault: ResumeVaultPage,
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)

  const PageComponent = PAGE_MAP[page] || DashboardPage

  function navigate(id) {
    setPage(id)
    setMenuOpen(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Overlay — mobile only, closes menu when tapped */}
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
          <PageComponent setPage={navigate} />
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
