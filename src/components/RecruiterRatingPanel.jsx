// src/components/RecruiterRatingPanel.jsx
// Recruiter star ratings + notes + cross-reference by firm

import { useState } from 'react'
import { Star, Mail, Phone, Building2, ExternalLink } from 'lucide-react'

function StarRating({ value, onChange, readonly }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => !readonly && onChange?.(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{
            background: 'none', border: 'none', cursor: readonly ? 'default' : 'pointer',
            padding: 0, color: n <= (hover || value) ? '#facc15' : 'var(--border)',
            transition: 'color .1s', lineHeight: 1,
          }}
        >
          <Star size={14} fill={n <= (hover || value) ? '#facc15' : 'none'} />
        </button>
      ))}
    </div>
  )
}

export default function RecruiterRatingPanel({ leads = [], recruiters = {}, onRate }) {
  const [editing, setEditing] = useState(null)
  const [draftRating, setDraftRating] = useState(0)
  const [draftNotes, setDraftNotes] = useState('')
  const [filterFirm, setFilterFirm] = useState('All')

  // Build recruiter index from leads
  const recruiterMap = {}
  leads.forEach(l => {
    if (!l.contact_name && !l.contact_email) return
    const key = l.contact_email || l.contact_name
    if (!recruiterMap[key]) {
      recruiterMap[key] = {
        name: l.contact_name || '—',
        email: l.contact_email || '',
        firm: l.company || l.via || '—',
        leads: [],
      }
    }
    recruiterMap[key].leads.push(l)
  })

  // Merge with saved ratings
  Object.entries(recruiterMap).forEach(([key, rec]) => {
    if (recruiters[key]) {
      recruiterMap[key] = { ...rec, ...recruiters[key] }
    }
  })

  const allFirms = ['All', ...new Set(Object.values(recruiterMap).map(r => r.firm))]
  const displayed = Object.entries(recruiterMap).filter(([, r]) => filterFirm === 'All' || r.firm === filterFirm)

  const startEdit = (key, rec) => {
    setEditing(key)
    setDraftRating(rec.rating || 0)
    setDraftNotes(rec.notes || '')
  }

  const saveEdit = (key, rec) => {
    onRate?.(rec.email || key, draftRating, draftNotes)
    setEditing(null)
  }

  if (displayed.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text3)' }}>
        <Building2 size={24} style={{ opacity: .3, marginBottom: 8 }} />
        <div style={{ fontSize: 13 }}>No recruiters found in leads yet</div>
        <div style={{ fontSize: 11, marginTop: 4 }}>Add contact names/emails to your leads to track recruiters here</div>
      </div>
    )
  }

  return (
    <div>
      {/* Firm filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {allFirms.map(f => (
          <button
            key={f}
            onClick={() => setFilterFirm(f)}
            style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 10,
              fontFamily: 'var(--font-mono)', cursor: 'pointer',
              background: filterFirm === f ? 'var(--accent)' : 'var(--bg2)',
              color: filterFirm === f ? '#000' : 'var(--text3)',
              border: `1px solid ${filterFirm === f ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {displayed.map(([key, rec]) => (
          <div key={key} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{rec.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Building2 size={9} />{rec.firm}</span>
                  {rec.email && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Mail size={9} />{rec.email}</span>}
                </div>
                <StarRating value={rec.rating || 0} readonly={editing !== key} onChange={v => setDraftRating(v)} />
              </div>
              <button
                onClick={() => editing === key ? saveEdit(key, rec) : startEdit(key, rec)}
                style={{
                  padding: '5px 12px', borderRadius: 'var(--radius)', fontSize: 11,
                  background: editing === key ? 'var(--accent)' : 'var(--bg3)',
                  color: editing === key ? '#000' : 'var(--text3)',
                  border: `1px solid ${editing === key ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer', fontWeight: editing === key ? 700 : 400, flexShrink: 0,
                }}
              >
                {editing === key ? 'Save' : 'Rate'}
              </button>
            </div>

            {editing === key && (
              <div style={{ marginTop: 10 }}>
                <div style={{ marginBottom: 6 }}>
                  <StarRating value={draftRating} onChange={setDraftRating} />
                </div>
                <textarea
                  value={draftNotes}
                  onChange={e => setDraftNotes(e.target.value)}
                  placeholder="Notes about this recruiter (responsive, ghosted, good fit, etc.)"
                  rows={2}
                  style={{
                    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', color: 'var(--text)', padding: '6px 8px',
                    fontSize: 11, resize: 'vertical', fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>
            )}

            {rec.notes && editing !== key && (
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.5 }}>
                "{rec.notes}"
              </div>
            )}

            {/* Linked leads */}
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
                {rec.leads.length} lead{rec.leads.length !== 1 ? 's' : ''} linked
              </div>
              {rec.leads.map(l => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: 11, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text2)' }}>{l.role_title}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{l.status}</span>
                    {l.apply_link && (
                      <a href={l.apply_link} target="_blank" rel="noreferrer" style={{ color: 'var(--accent2)' }}>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
