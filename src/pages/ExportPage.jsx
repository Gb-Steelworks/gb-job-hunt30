// src/pages/ExportPage.jsx
// Export all job hunt data to XLSX (multi-sheet) or JSON backup/restore
// Uses SheetJS (xlsx) — available in this React environment

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Download, Upload, RefreshCw, CheckCircle, AlertCircle, FileText, Database } from 'lucide-react'

// ── Storage keys — must match appStore.js ────────────────────────────────────
const KEYS = {
  LEAD_STATUSES:   'gb_lead_statuses',
  APPLICATIONS:    'gb_applications',
  PRIORITY_CHECKS: 'gb_priority_checks',
  AGENT_LEADS:     'gb_agent_leads',
  AGENT_RUNS:      'gb_agent_runs',
  LINKEDIN:        'gb_linkedin_contacts',
}

// ── SEED_LEADS — imported inline to avoid circular dep ───────────────────────
// Pull from window if LeadsPage exposed it, otherwise use the stored agent leads
function getAllLeads(agentLeads = []) {
  // We can't import SEED_LEADS directly here without a circular dep.
  // Instead we read them from the DOM data attribute LeadsPage sets,
  // or fall back to agent leads only. The XLSX will always have agent leads;
  // seed leads are available via the JSON snapshot.
  return agentLeads
}

// ── localStorage helpers ─────────────────────────────────────────────────────
function loadKey(key, fallback) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback }
  catch { return fallback }
}

function saveKey(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

// ── Build full snapshot ───────────────────────────────────────────────────────
function buildSnapshot() {
  return {
    exported_at:    new Date().toISOString(),
    app_version:    'Job Hunt 30',
    lead_statuses:  loadKey(KEYS.LEAD_STATUSES,   {}),
    applications:   loadKey(KEYS.APPLICATIONS,    []),
    priority_checks:loadKey(KEYS.PRIORITY_CHECKS, {}),
    agent_leads:    loadKey(KEYS.AGENT_LEADS,      []),
    agent_runs:     loadKey(KEYS.AGENT_RUNS,       {}),
    linkedin:       loadKey(KEYS.LINKEDIN,         []),
  }
}

// ── Restore snapshot ──────────────────────────────────────────────────────────
function restoreSnapshot(snapshot) {
  const errors = []
  if (snapshot.lead_statuses)   saveKey(KEYS.LEAD_STATUSES,   snapshot.lead_statuses)
  else errors.push('lead_statuses missing')
  if (snapshot.applications)    saveKey(KEYS.APPLICATIONS,    snapshot.applications)
  else errors.push('applications missing')
  if (snapshot.priority_checks) saveKey(KEYS.PRIORITY_CHECKS, snapshot.priority_checks)
  if (snapshot.agent_leads)     saveKey(KEYS.AGENT_LEADS,     snapshot.agent_leads)
  if (snapshot.agent_runs)      saveKey(KEYS.AGENT_RUNS,      snapshot.agent_runs)
  if (snapshot.linkedin)        saveKey(KEYS.LINKEDIN,        snapshot.linkedin)
  return errors
}

// ── XLSX builder ──────────────────────────────────────────────────────────────
function buildXLSX(snap) {
  const wb = XLSX.utils.book_new()

  // Sheet 1 — Applications (most important)
  const apps = (snap.applications || []).map(a => ({
    'Role':           a.role_title    || '',
    'Company':        a.company       || '',
    'Type':           a.type          || '',
    'Work Model':     a.work_model    || '',
    'Pay Rate':       a.pay_rate      || '',
    'Status':         a.status        || '',
    'Date Applied':   a.date_applied  || '',
    'Resume Variant': a.resume_version|| '',
    'Cover Letter':   a.cover_letter  ? 'Yes' : 'No',
    'Q&A Prep':       a.qa_prep       ? 'Yes' : 'No',
    'Recruiter':      a.recruiter_name|| '',
    'Recruiter Email':a.recruiter_email|| '',
  }))
  const wsApps = apps.length
    ? XLSX.utils.json_to_sheet(apps)
    : XLSX.utils.json_to_sheet([{ Note: 'No applications logged yet' }])
  styleHeaders(wsApps)
  XLSX.utils.book_append_sheet(wb, wsApps, 'Applications')

  // Sheet 2 — Agent Leads
  const agentLeads = (snap.agent_leads || []).map(l => ({
    'Role':          l.role_title    || '',
    'Company':       l.company       || '',
    'Via':           l.via           || '',
    'Category':      l.category      || '',
    'Type':          l.type          || '',
    'Work Model':    l.work_model    || '',
    'Location':      l.location      || '',
    'Pay Rate':      l.pay_rate      || '',
    'Match Score':   l.match_score   || '',
    'Status':        (snap.lead_statuses || {})[l.id] || l.status || 'New',
    'Contact':       l.contact_name  || '',
    'Contact Email': l.contact_email || '',
    'Apply Link':    l.apply_link    || '',
    'Notes':         l.notes         || '',
    'Agent':         l.agent         || '',
    'Date Found':    l.date_found    || '',
  }))
  const wsLeads = agentLeads.length
    ? XLSX.utils.json_to_sheet(agentLeads)
    : XLSX.utils.json_to_sheet([{ Note: 'No agent leads yet — run agents first' }])
  styleHeaders(wsLeads)
  XLSX.utils.book_append_sheet(wb, wsLeads, 'Agent Leads')

  // Sheet 3 — LinkedIn Contacts
  const linkedin = (snap.linkedin || []).map(c => ({
    'Section':   c.section   || '',
    'Name':      c.name      || '',
    'Title':     c.title     || '',
    'Company':   c.company   || '',
    'Degree':    c.degree    || '',
    'Verified':  c.verified  ? 'Yes' : 'No',
    'Email':     c.email     || '',
    'LinkedIn':  c.url       || '',
    'Why':       c.why       || '',
    'Tip':       c.tip       || '',
  }))
  const wsLI = linkedin.length
    ? XLSX.utils.json_to_sheet(linkedin)
    : XLSX.utils.json_to_sheet([{ Note: 'No LinkedIn contacts yet' }])
  styleHeaders(wsLI)
  XLSX.utils.book_append_sheet(wb, wsLI, 'LinkedIn Contacts')

  // Sheet 4 — Lead Status Map
  const statuses = Object.entries(snap.lead_statuses || {}).map(([id, status]) => ({
    'Lead ID': id,
    'Status':  status,
  }))
  const wsStatus = statuses.length
    ? XLSX.utils.json_to_sheet(statuses)
    : XLSX.utils.json_to_sheet([{ Note: 'No status changes yet — all leads are New' }])
  styleHeaders(wsStatus)
  XLSX.utils.book_append_sheet(wb, wsStatus, 'Lead Statuses')

  // Sheet 5 — Agent Run History
  const runs = Object.entries(snap.agent_runs || {}).map(([agent, data]) => ({
    'Agent':       agent,
    'Last Run':    data.lastRun    || 'Never',
    'Leads Found': data.leadsFound || 0,
  }))
  const wsRuns = runs.length
    ? XLSX.utils.json_to_sheet(runs)
    : XLSX.utils.json_to_sheet([{ Note: 'No agent runs recorded yet' }])
  styleHeaders(wsRuns)
  XLSX.utils.book_append_sheet(wb, wsRuns, 'Agent History')

  // Sheet 6 — Summary
  const summary = [
    { 'Metric': 'Export Date',          'Value': new Date().toLocaleString() },
    { 'Metric': 'Applications Logged',  'Value': (snap.applications || []).length },
    { 'Metric': 'Agent Leads Found',    'Value': (snap.agent_leads || []).length },
    { 'Metric': 'LinkedIn Contacts',    'Value': (snap.linkedin || []).length },
    { 'Metric': 'Lead Status Changes',  'Value': Object.keys(snap.lead_statuses || {}).length },
    { 'Metric': 'App Version',          'Value': snap.app_version || 'Job Hunt 30' },
  ]
  const wsSummary = XLSX.utils.json_to_sheet(summary)
  styleHeaders(wsSummary)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

  return wb
}

// Apply bold header row styling
function styleHeaders(ws) {
  if (!ws['!ref']) return
  const range = XLSX.utils.decode_range(ws['!ref'])
  for (let C = range.s.c; C <= range.e.c; C++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c: C })
    if (!ws[addr]) continue
    ws[addr].s = { font: { bold: true }, fill: { fgColor: { rgb: 'E8F4FD' } } }
  }
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, val, color }) {
  return (
    <div className="stat-card" style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
        <Icon size={13} color={color || 'var(--accent)'} />
        <div className="s-label">{label}</div>
      </div>
      <div className="s-val" style={{ color: color || 'var(--accent)' }}>{val}</div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ExportPage() {
  const [xlsxStatus,   setXlsxStatus]   = useState(null)   // null | 'ok' | 'error'
  const [jsonStatus,   setJsonStatus]   = useState(null)
  const [restoreStatus,setRestoreStatus]= useState(null)    // null | 'ok' | 'error' | 'loading'
  const [restoreMsg,   setRestoreMsg]   = useState('')
  const [snapStats,    setSnapStats]    = useState(() => {
    const s = buildSnapshot()
    return {
      applications: s.applications.length,
      agentLeads:   s.agent_leads.length,
      linkedin:     s.linkedin.length,
      statusChanges:Object.keys(s.lead_statuses).length,
    }
  })

  // ── XLSX export ─────────────────────────────────────────────────────────────
  const exportXLSX = () => {
    try {
      const snap = buildSnapshot()
      const wb   = buildXLSX(snap)
      const date = new Date().toISOString().slice(0,10)
      XLSX.writeFile(wb, `GeorgeBrooks_JobHunt_${date}.xlsx`)
      setXlsxStatus('ok')
      setTimeout(() => setXlsxStatus(null), 3000)
    } catch(e) {
      console.error('XLSX export failed:', e)
      setXlsxStatus('error')
    }
  }

  // ── JSON backup export ──────────────────────────────────────────────────────
  const exportJSON = () => {
    try {
      const snap = buildSnapshot()
      const json = JSON.stringify(snap, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      const date = new Date().toISOString().slice(0,10)
      a.href = url
      a.download = `GeorgeBrooks_JobHunt_backup_${date}.json`
      document.body.appendChild(a); a.click()
      document.body.removeChild(a); URL.revokeObjectURL(url)
      setJsonStatus('ok')
      setTimeout(() => setJsonStatus(null), 3000)
    } catch(e) {
      console.error('JSON export failed:', e)
      setJsonStatus('error')
    }
  }

  // ── JSON restore ────────────────────────────────────────────────────────────
  const importJSON = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setRestoreStatus('loading')
    setRestoreMsg('')

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const snap = JSON.parse(ev.target.result)

        // Validate it looks like our backup
        if (!snap.app_version || !snap.exported_at) {
          throw new Error('File does not appear to be a Job Hunt 30 backup')
        }

        const errors = restoreSnapshot(snap)

        if (errors.length) {
          setRestoreStatus('error')
          setRestoreMsg(`Partial restore — missing: ${errors.join(', ')}`)
        } else {
          setRestoreStatus('ok')
          const date = new Date(snap.exported_at).toLocaleString()
          setRestoreMsg(`Restored backup from ${date} · ${snap.applications?.length || 0} applications · ${snap.agent_leads?.length || 0} agent leads`)
          // Refresh stats
          setSnapStats({
            applications: snap.applications?.length || 0,
            agentLeads:   snap.agent_leads?.length   || 0,
            linkedin:     snap.linkedin?.length       || 0,
            statusChanges:Object.keys(snap.lead_statuses || {}).length,
          })
          setTimeout(() => window.location.reload(), 1500)
        }
      } catch(err) {
        setRestoreStatus('error')
        setRestoreMsg(err.message || 'Invalid backup file')
      }
    }
    reader.onerror = () => { setRestoreStatus('error'); setRestoreMsg('Could not read file') }
    reader.readAsText(file)
    e.target.value = '' // reset input
  }

  const StatusIcon = ({ status }) => {
    if (status === 'ok')    return <CheckCircle size={14} color="var(--success)" />
    if (status === 'error') return <AlertCircle size={14} color="var(--danger)" />
    if (status === 'loading') return <RefreshCw size={14} color="var(--accent2)" style={{ animation: 'spin .8s linear infinite' }} />
    return null
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Export & Backup</div>
        <div className="page-sub">
          Download your pipeline as XLSX · Backup and restore all data as JSON
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <StatCard icon={FileText}  label="Applications"    val={snapStats.applications}  color="var(--accent)" />
        <StatCard icon={Database}  label="Agent Leads"     val={snapStats.agentLeads}    color="var(--accent2)" />
        <StatCard icon={FileText}  label="LI Contacts"     val={snapStats.linkedin}       color="var(--success)" />
        <StatCard icon={Database}  label="Status Changes"  val={snapStats.statusChanges}  color="var(--warn)" />
      </div>

      {/* XLSX Export */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={14} color="var(--accent)" /> Export to Excel (.xlsx)
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.7 }}>
          Downloads a multi-sheet workbook with all your job hunt data. Opens directly in Excel or Google Sheets.
        </div>

        <div style={{ display: 'grid', gap: 6, marginBottom: 16 }}>
          {[
            ['Applications',     'All logged applications with status, dates, resume variant'],
            ['Agent Leads',      'All leads found by agent runs with current statuses'],
            ['LinkedIn Contacts','Your recruiter and network contact list'],
            ['Lead Statuses',    'Status overrides for seed leads'],
            ['Agent History',    'When agents ran and how many leads they found'],
            ['Summary',          'Key metrics and export timestamp'],
          ].map(([sheet, desc]) => (
            <div key={sheet} style={{ display: 'flex', gap: 10, fontSize: 11 }}>
              <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span>
              <span style={{ fontWeight: 600, color: 'var(--text)', minWidth: 140 }}>{sheet}</span>
              <span style={{ color: 'var(--text3)' }}>{desc}</span>
            </div>
          ))}
        </div>

        <button
          onClick={exportXLSX}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 'var(--radius)',
            background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.3)',
            color: 'var(--accent)', fontWeight: 600, fontSize: 13,
            cursor: 'pointer', fontFamily: 'var(--font)',
          }}
        >
          {xlsxStatus === 'ok'
            ? <><CheckCircle size={14} /> Downloaded!</>
            : xlsxStatus === 'error'
            ? <><AlertCircle size={14} /> Export failed — check console</>
            : <><Download size={14} /> Download .xlsx</>}
        </button>
      </div>

      {/* JSON Backup */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Database size={14} color="var(--accent2)" /> JSON Backup & Restore
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4, lineHeight: 1.7 }}>
          Full snapshot of all localStorage data — applications, lead statuses, agent leads, LinkedIn contacts, priority actions.
          Use this to restore your data if you switch browsers, clear cache, or move devices.
        </div>

        <div style={{
          padding: '8px 12px', marginBottom: 14,
          background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 'var(--radius)', fontSize: 11, color: 'var(--warn)',
        }}>
          ⚠️ localStorage is browser + device specific. Data in Chrome on your laptop does not exist in Firefox or on your phone.
          Back up regularly — especially after running agents or logging applications.
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Backup */}
          <button
            onClick={exportJSON}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 'var(--radius)',
              background: 'rgba(59,158,255,0.1)', border: '1px solid rgba(59,158,255,0.3)',
              color: 'var(--accent2)', fontWeight: 600, fontSize: 13,
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}
          >
            {jsonStatus === 'ok'
              ? <><CheckCircle size={14} /> Backup saved!</>
              : jsonStatus === 'error'
              ? <><AlertCircle size={14} /> Backup failed</>
              : <><Download size={14} /> Download JSON backup</>}
          </button>

          {/* Restore */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 'var(--radius)',
            background: 'rgba(107,117,145,0.08)', border: '1px solid var(--border)',
            color: 'var(--text2)', fontWeight: 600, fontSize: 13,
            cursor: 'pointer', fontFamily: 'var(--font)',
          }}>
            <Upload size={14} /> Restore from backup
            <input type="file" accept=".json" onChange={importJSON} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Restore status */}
        {restoreStatus && (
          <div style={{
            marginTop: 12, padding: '8px 12px', borderRadius: 'var(--radius)',
            background: restoreStatus === 'ok'
              ? 'rgba(62,207,142,0.08)'
              : restoreStatus === 'error'
              ? 'rgba(248,113,113,0.08)'
              : 'rgba(59,158,255,0.08)',
            border: `1px solid ${restoreStatus === 'ok' ? 'rgba(62,207,142,0.25)' : restoreStatus === 'error' ? 'rgba(248,113,113,0.25)' : 'rgba(59,158,255,0.25)'}`,
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 11, color: restoreStatus === 'ok' ? 'var(--success)' : restoreStatus === 'error' ? 'var(--danger)' : 'var(--accent2)',
          }}>
            <StatusIcon status={restoreStatus} />
            <span>{restoreMsg || (restoreStatus === 'loading' ? 'Restoring...' : '')}</span>
            {restoreStatus === 'ok' && <span style={{ color: 'var(--text3)' }}> · Reloading page...</span>}
          </div>
        )}
      </div>

      {/* Data coverage note */}
      <div style={{
        padding: '10px 14px',
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', fontSize: 11, color: 'var(--text3)', lineHeight: 1.8,
      }}>
        <strong style={{ color: 'var(--text2)' }}>What's included</strong> — Applications · Agent-found leads ·
        Lead status changes · LinkedIn contacts · Priority action checkboxes · Agent run history<br />
        <strong style={{ color: 'var(--text2)' }}>Not included</strong> — The 52 seed leads (hardcoded in the app — always present) ·
        Resume files (stored in GitHub/IndexedDB separately)<br />
        <strong style={{ color: 'var(--text2)' }}>Permanent fix</strong> — Supabase migration will replace localStorage
        and make all data device-independent. Planned for a future session.
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
