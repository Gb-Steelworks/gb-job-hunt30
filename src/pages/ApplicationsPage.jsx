// ApplicationsPage.jsx — UPDATED
// Changes from original:
//   1. Accepts `pendingApplications` prop — auto-logged entries from RoleActionPanel
//   2. useEffect merges pending apps in when they arrive (deduped by id)
//   3. resume_version column added to table
//   4. Everything else identical to your original

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'

const STATUS_OPTIONS = ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected', 'Ghosted']
const METHOD_OPTIONS = ['Direct Apply', 'Recruiter Submitted', 'Referral', 'LinkedIn Easy Apply']

export function ApplicationsPage({ pendingApplications = [] }) {
  const [apps, setApps] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    role_title: '', company: '', date_applied: '', recruiter_name: '', recruiter_email: '',
    application_method: 'Direct Apply', resume_version: '', status: 'Applied', notes: '',
    next_action: '', next_action_date: ''
  })

  // Merge in any apps auto-logged from RoleActionPanel
  useEffect(() => {
    if (!pendingApplications.length) return
    setApps(prev => {
      const ids = new Set(prev.map(a => a.id))
      const newOnes = pendingApplications
        .filter(a => !ids.has(a.id))
        .map(a => ({
          id: a.id || Date.now(),
          role_title: a.role_title,
          company: a.company,
          date_applied: a.date_applied || new Date().toISOString().split('T')[0],
          recruiter_name: a.recruiter_name || a.contact_name || '',
          recruiter_email: a.recruiter_email || a.contact_email || '',
          application_method: 'Direct Apply',
          resume_version: a.resume_version || a.resumeVariant || '',
          status: 'Applied',
          notes: '',
          next_action: 'Follow up in 5 business days',
          next_action_date: '',
          cover_letter: a.cover_letter || false,
        }))
      return [...prev, ...newOnes]
    })
  }, [pendingApplications])

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const addApp = () => {
    if (!form.role_title || !form.company) return
    setApps(a => [...a, { id: Date.now(), ...form }])
    setForm({
      role_title: '', company: '', date_applied: '', recruiter_name: '', recruiter_email: '',
      application_method: 'Direct Apply', resume_version: '', status: 'Applied', notes: '',
      next_action: '', next_action_date: ''
    })
    setShowForm(false)
  }

  const updateStatus = (id, val) => setApps(apps.map(a => a.id === id ? { ...a, status: val } : a))

  const statusColor = (s) => {
    const map = {
      Applied: 'var(--accent2)', 'Phone Screen': 'var(--warn)', Interview: '#fb923c',
      Offer: 'var(--success)', Rejected: 'var(--danger)', Ghosted: 'var(--text3)'
    }
    return map[s] || 'var(--text3)'
  }

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="page-title">Applications</div>
            <div className="page-sub">Track every submission · update status as you progress</div>
          </div>
          <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}><Plus size={12} /> Log application</button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Log new application</div>
          <div className="form-grid-3">
            <div className="field"><label>Role title *</label><input type="text" placeholder="e.g. Sr. QA Analyst" value={form.role_title} onChange={e => f('role_title', e.target.value)} /></div>
            <div className="field"><label>Company *</label><input type="text" placeholder="e.g. Enbridge" value={form.company} onChange={e => f('company', e.target.value)} /></div>
            <div className="field"><label>Date applied</label><input type="text" placeholder="e.g. 2026-05-03" value={form.date_applied} onChange={e => f('date_applied', e.target.value)} /></div>
            <div className="field"><label>Recruiter name</label><input type="text" value={form.recruiter_name} onChange={e => f('recruiter_name', e.target.value)} /></div>
            <div className="field"><label>Recruiter email</label><input type="text" value={form.recruiter_email} onChange={e => f('recruiter_email', e.target.value)} /></div>
            <div className="field"><label>Method</label><select value={form.application_method} onChange={e => f('application_method', e.target.value)}>{METHOD_OPTIONS.map(m => <option key={m}>{m}</option>)}</select></div>
            <div className="field"><label>Resume variant</label>
              <select value={form.resume_version} onChange={e => f('resume_version', e.target.value)}>
                <option value="">— select —</option>
                {['fsi','consulting','pm','qa','delivery'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="field"><label>Next action</label><input type="text" placeholder="e.g. Follow up in 5 days" value={form.next_action} onChange={e => f('next_action', e.target.value)} /></div>
            <div className="field"><label>Next action date</label><input type="text" placeholder="e.g. 2026-05-08" value={form.next_action_date} onChange={e => f('next_action_date', e.target.value)} /></div>
            <div className="field"><label>Status</label><select value={form.status} onChange={e => f('status', e.target.value)}>{STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div className="field" style={{ marginBottom: 12 }}><label>Notes</label><textarea value={form.notes} onChange={e => f('notes', e.target.value)} /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-accent" onClick={addApp}>Save application</button>
            <button className="btn" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {apps.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty-icon">📋</div>
            No applications logged yet.<br />
            Click "Prep ↗" on any lead and use Step 5 to auto-log, or click "Log application" above.
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th style={{ width: 160 }}>Role</th>
              <th style={{ width: 110 }}>Company</th>
              <th style={{ width: 90 }}>Applied</th>
              <th style={{ width: 110 }}>Recruiter</th>
              <th style={{ width: 80 }}>Variant</th>
              <th style={{ width: 110 }}>Status</th>
              <th style={{ width: 130 }}>Next action</th>
              <th>Notes</th>
            </tr></thead>
            <tbody>
              {apps.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 500, color: 'var(--text)' }}>{a.role_title}</td>
                  <td style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{a.company}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{a.date_applied || '—'}</td>
                  <td style={{ fontSize: 11 }}>
                    <div style={{ color: 'var(--text)' }}>{a.recruiter_name || '—'}</div>
                    {a.recruiter_email && <div style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>{a.recruiter_email}</div>}
                  </td>
                  <td>
                    {a.resume_version
                      ? <span className="pill pill-qa" style={{ fontSize: 9 }}>{a.resume_version}</span>
                      : <span style={{ color: 'var(--text3)', fontSize: 11 }}>—</span>
                    }
                  </td>
                  <td>
                    <select className="status-sel" value={a.status} onChange={e => updateStatus(a.id, e.target.value)} style={{ color: statusColor(a.status) }}>
                      {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ fontSize: 11 }}>
                    {a.next_action && <div style={{ color: 'var(--text)' }}>{a.next_action}</div>}
                    {a.next_action_date && <div style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>{a.next_action_date}</div>}
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--text3)' }}>{a.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ApplicationsPage
