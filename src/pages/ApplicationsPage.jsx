// src/pages/ApplicationsPage.jsx
// Full application pipeline: Applied → Reply → Interview Pending → Interviewed → Offer → Closed

import { useState } from 'react'
import { ChevronRight, Star, ExternalLink, Clock, TrendingUp, Pencil, Check, X } from 'lucide-react'

const STAGES = ['Applied', 'Reply', 'Interview Pending', 'Interviewed', 'Offer', 'Closed']

const STAGE_COLORS = {
  'Applied':           { bg: 'rgba(0,153,255,0.12)',  border: 'rgba(0,153,255,0.3)',  text: '#3b82f6' },
  'Reply':             { bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.3)', text: '#fb923c' },
  'Interview Pending': { bg: 'rgba(250,204,21,0.12)', border: 'rgba(250,204,21,0.3)', text: '#facc15' },
  'Interviewed':       { bg: 'rgba(0,212,170,0.12)',  border: 'rgba(0,212,170,0.3)',  text: '#00d4aa' },
  'Offer':             { bg: 'rgba(62,207,142,0.15)', border: 'rgba(62,207,142,0.4)', text: '#3ecf8e' },
  'Closed':            { bg: 'rgba(120,120,120,0.12)',border: 'rgba(120,120,120,0.3)',text: '#888' },
}

function StageBadge({ status, onClick }) {
  const c = STAGE_COLORS[status] || STAGE_COLORS['Applied']
  return (
    <button
      onClick={onClick}
      title="Click to advance stage"
      style={{
        background: c.bg, border: `1px solid ${c.border}`, color: c.text,
        borderRadius: 20, padding: '3px 10px', fontSize: 10,
        fontFamily: 'var(--font-mono)', fontWeight: 600, cursor: onClick ? 'pointer' : 'default',
        whiteSpace: 'nowrap', transition: 'opacity .15s',
      }}
    >
      {status}
    </button>
  )
}

function StageBar({ current }) {
  const idx = STAGES.indexOf(current)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }}>
      {STAGES.map((s, i) => {
        const done = i < idx
        const active = i === idx
        const c = STAGE_COLORS[s]
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{
              flex: 1, height: 4,
              background: done || active ? c.text : 'var(--border)',
              borderRadius: i === 0 ? '2px 0 0 2px' : i === STAGES.length - 1 ? '0 2px 2px 0' : 0,
              transition: 'background .3s',
            }} />
            {i < STAGES.length - 1 && (
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: done ? c.text : 'var(--border)', flexShrink: 0 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function ApplicationsPage({ applications = [], onAdvanceStage, onSetStatus }) {
  const [filter,  setFilter]  = useState('All')
  const [selected, setSelected] = useState(null)
  const [editing,  setEditing]  = useState(null)   // id of app being edited
  const [editForm, setEditForm] = useState({})      // { role_title, job_id, apply_link }

  const startEdit = (e, a) => {
    e.stopPropagation()
    setEditing(a.id)
    setEditForm({ role_title: a.role_title || '', job_id: a.job_id || '', apply_link: a.apply_link || '' })
  }

  const saveEdit = (e, a) => {
    e.stopPropagation()
    onSetStatus?.(a.id, a.status, editForm)   // reuse onSetStatus as a generic update fn
    setEditing(null)
  }

  const cancelEdit = (e) => { e.stopPropagation(); setEditing(null) }

  const filtered = filter === 'All' ? applications : applications.filter(a => a.status === filter)

  const counts = STAGES.reduce((acc, s) => {
    acc[s] = applications.filter(a => a.status === s).length
    return acc
  }, { All: applications.length })

  const app = applications.find(a => a.id === selected)

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Applications</div>
        <div className="page-sub">Track every submission through offer — click a stage badge to advance</div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8, marginBottom: 20 }}>
        {[
          { label: 'Total', val: applications.length, color: 'var(--text)' },
          { label: 'Active', val: applications.filter(a => !['Closed'].includes(a.status)).length, color: 'var(--accent)' },
          { label: 'Interviews', val: counts['Interview Pending'] + counts['Interviewed'], color: '#facc15' },
          { label: 'Offers', val: counts['Offer'], color: 'var(--success)' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: k.color, fontFamily: 'var(--font-mono)' }}>{k.val}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Stage filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {['All', ...STAGES].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 11,
              fontFamily: 'var(--font-mono)', cursor: 'pointer',
              background: filter === s ? 'var(--accent)' : 'var(--bg2)',
              color: filter === s ? '#000' : 'var(--text3)',
              border: `1px solid ${filter === s ? 'var(--accent)' : 'var(--border)'}`,
              fontWeight: filter === s ? 700 : 400,
            }}
          >
            {s} {counts[s] > 0 && <span style={{ opacity: .7 }}>({counts[s]})</span>}
          </button>
        ))}
      </div>

      {applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
          <TrendingUp size={28} style={{ opacity: .3, marginBottom: 10 }} />
          <div style={{ fontSize: 14, marginBottom: 6 }}>No applications logged yet</div>
          <div style={{ fontSize: 12 }}>Use the Prep panel on any lead → Step 5 to log your first application</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)', fontSize: 13 }}>
          No applications in this stage
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {filtered.map(a => (
            <div
              key={a.id}
              className="card"
              style={{ cursor: 'pointer', transition: 'border-color .15s', borderColor: selected === a.id ? 'var(--accent)' : undefined }}
              onClick={() => setSelected(selected === a.id ? null : a.id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.role_title}
                    {a.job_id && <span style={{ marginLeft: 8, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent2)', fontWeight: 400 }}>#{a.job_id}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span>{a.company}</span>
                    {a.date_applied && <><span>·</span><span><Clock size={9} style={{ verticalAlign: 'middle', marginRight: 3 }} />{a.date_applied}</span></>}
                    {a.resume_version && <><span>·</span><span style={{ color: 'var(--accent2)' }}>{a.resume_version}</span></>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <StageBadge
                    status={a.status}
                    onClick={(e) => { e.stopPropagation(); onAdvanceStage?.(a.id) }}
                  />
                  <ChevronRight size={12} color="var(--text3)" style={{ transform: selected === a.id ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
                </div>
              </div>

              {/* Expanded detail */}
              {selected === a.id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <StageBar current={a.status} />

                  {/* ── Inline edit form ── */}
                  {editing === a.id ? (
                    <div style={{ marginBottom: 14, padding: '12px 14px', background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 'var(--radius)' }}
                      onClick={e => e.stopPropagation()}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginBottom: 10 }}>Edit application details</div>
                      <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>Role title</div>
                          <input
                            type="text"
                            value={editForm.role_title}
                            onChange={e => setEditForm(f => ({ ...f, role_title: e.target.value }))}
                            style={{ width: '100%', fontSize: 12 }}
                            placeholder="e.g. Senior Business Analyst"
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>Job ID / Req #</div>
                            <input
                              type="text"
                              value={editForm.job_id}
                              onChange={e => setEditForm(f => ({ ...f, job_id: e.target.value }))}
                              style={{ width: '100%', fontSize: 12 }}
                              placeholder="e.g. JR-12345"
                            />
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>Apply URL</div>
                            <input
                              type="url"
                              value={editForm.apply_link}
                              onChange={e => setEditForm(f => ({ ...f, apply_link: e.target.value }))}
                              style={{ width: '100%', fontSize: 12 }}
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button onClick={cancelEdit}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', fontSize: 11, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text3)', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                          <X size={11} /> Cancel
                        </button>
                        <button onClick={e => saveEdit(e, a)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', fontSize: 11, background: 'rgba(0,212,170,0.12)', border: '1px solid rgba(0,212,170,0.3)', borderRadius: 'var(--radius)', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font)' }}>
                          <Check size={11} /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── Read view with edit button ── */
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                        {[
                          ['Type',         a.type],
                          ['Work model',   a.work_model],
                          ['Cover letter', a.cover_letter ? '✅ Yes' : '—'],
                          ['Q&A prep',     a.qa_prep ? '✅ Yes' : '—'],
                          ['Recruiter',    a.recruiter_name || '—'],
                          ['Contact',      a.recruiter_email || '—'],
                          ['Job ID',       a.job_id || '—'],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>{k}</div>
                            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <button onClick={e => startEdit(e, a)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', fontSize: 11, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text3)', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                        <Pencil size={11} /> Edit title / Job ID / URL
                      </button>
                    </div>
                  )}

                  {/* Stage selector */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {STAGES.map(s => (
                      <button
                        key={s}
                        onClick={(e) => { e.stopPropagation(); onSetStatus?.(a.id, s) }}
                        style={{
                          padding: '4px 10px', borderRadius: 20, fontSize: 10,
                          fontFamily: 'var(--font-mono)', cursor: 'pointer',
                          background: a.status === s ? STAGE_COLORS[s].bg : 'var(--bg)',
                          color: a.status === s ? STAGE_COLORS[s].text : 'var(--text3)',
                          border: `1px solid ${a.status === s ? STAGE_COLORS[s].border : 'var(--border)'}`,
                          fontWeight: a.status === s ? 700 : 400,
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* Apply link */}
                  {(a.apply_link || editForm.apply_link) && editing !== a.id && (
                    <a href={a.apply_link} target="_blank" rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 10, fontSize: 11, color: 'var(--accent2)' }}
                      onClick={e => e.stopPropagation()}>
                      <ExternalLink size={11} /> View posting
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
