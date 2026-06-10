// src/pages/LinkedInPage.jsx
// Editable LinkedIn outreach board — contacts stored in localStorage
// Add/edit/remove contacts without touching code

import { useState, useEffect } from 'react'
import { ExternalLink, Plus, Pencil, Trash2, X, Check } from 'lucide-react'

const STORAGE_KEY = 'gb_linkedin_contacts'

const SECTIONS = [
  { id: 'recruiters',  label: 'Recruiters — active on your leads',         icon: '🎯' },
  { id: 'managers',    label: 'Hiring managers — worth finding',            icon: '👔' },
  { id: 'network',     label: '2nd-degree network — warm intro potential',  icon: '🔗' },
]

const SECTION_COLORS = {
  recruiters: 'var(--accent)',
  managers:   'var(--accent2)',
  network:    'var(--success)',
}

const DEGREE_OPTIONS = ['1st', '2nd', '3rd', 'Search']

// ── Seed data — verified contacts only, hallucinations removed ─────────────────
const SEED_CONTACTS = [
  // RECRUITERS
  {
    id: 's1', section: 'recruiters',
    name: 'Cole Withers', title: 'Technical Recruiter', company: 'Kforce',
    degree: '1st', verified: true,
    why: 'Your primary Kforce contact — confirmed active. Working BA/PO + Data PM roles. Has your resume. Follow up on open roles directly.',
    tip: 'Reach out via LinkedIn or email — confirm which roles are still active',
    url: 'https://www.linkedin.com/search/results/people/?keywords=Cole+Withers+Kforce',
    color: '#0d9488', initials: 'CW',
    email: '',
  },
  {
    id: 's2', section: 'recruiters',
    name: 'Staci Wells', title: 'Senior Talent Executive', company: 'Kforce',
    degree: '1st', verified: true,
    why: 'Works the HPE Spring TX account directly — same account as Cole. Backup contact if Cole is unavailable. Has active pipeline.',
    tip: 'swells@kforce.com · linkedin.com/in/staci-wells-48297b7b',
    url: 'https://www.linkedin.com/in/staci-wells-48297b7b',
    color: '#0369a1', initials: 'SW',
    email: 'swells@kforce.com',
  },
  {
    id: 's3', section: 'recruiters',
    name: 'Raise Recruiting', title: 'IT Staffing Recruiter', company: 'Raise (Enbridge partner)',
    degree: '2nd', verified: true,
    why: 'Placed the Enbridge IT QA Specialist IV role — 95% match in your leads list. 48-hour application review SLA.',
    tip: 'hello@raiserecruiting.com · 800-567-9675 · Email first, then connect on LinkedIn',
    url: 'https://www.linkedin.com/search/results/people/?keywords=Raise+Recruiting+Enbridge',
    color: '#065f46', initials: 'RR',
    email: 'hello@raiserecruiting.com',
  },

  // HIRING MANAGERS
  {
    id: 's4', section: 'managers',
    name: 'Find: Enbridge QA / Delivery Manager', title: 'IT Quality / Delivery Manager', company: 'Enbridge',
    degree: 'Search', verified: false,
    why: 'Identifying the hiring manager before your interview gives you context on team structure and what they value. Search after applying.',
    tip: 'Search "Enbridge IT quality manager Houston" on LinkedIn',
    url: 'https://www.linkedin.com/search/results/people/?keywords=Enbridge+IT+quality+manager+Houston',
    color: '#92400e', initials: 'EQ',
    email: '',
  },
  {
    id: 's5', section: 'managers',
    name: 'Find: Harris County IT Lead', title: 'IT Director / Universal Services Lead', company: 'Harris County',
    degree: 'Search', verified: false,
    why: 'You have an active application at Harris County (Sr BA + IT PM roles). Knowing the hiring manager before the interview is a competitive advantage.',
    tip: 'Search "Harris County Universal Services IT director" on LinkedIn',
    url: 'https://www.linkedin.com/search/results/people/?keywords=Harris+County+Universal+Services+IT+director',
    color: '#7c3aed', initials: 'HC',
    email: '',
  },

  // NETWORK
  {
    id: 's6', section: 'network',
    name: 'Your Capco Network', title: 'Former colleagues at FSI firms', company: 'Multiple',
    degree: '2nd', verified: true,
    why: 'Your Capco colleagues (2021-2024) are now distributed across JPMC, Wells, Schwab, and other FSI firms in Texas. A warm intro from a former colleague beats 10 cold applications.',
    tip: 'Filter LinkedIn 1st-degree connections by "Capco" — message anyone now at target companies',
    url: 'https://www.linkedin.com/search/results/people/?network=%5B%22F%22%5D&keywords=Capco+Houston',
    color: '#be185d', initials: 'CA',
    email: '',
  },
  {
    id: 's7', section: 'network',
    name: 'Your Deloitte Network', title: 'Former colleagues — senior level', company: 'Multiple',
    degree: '2nd', verified: true,
    why: 'Deloitte alumni (2011-2014) are now VPs, Directors, and Partners. Senior enough to make warm intros at FSI firms and consulting shops. Returnee advantage is real.',
    tip: 'Search 1st-degree connections filtered by "Deloitte" — focus on those at target companies',
    url: 'https://www.linkedin.com/search/results/people/?network=%5B%22F%22%5D&keywords=Deloitte+consulting+Houston',
    color: '#0c4a6e', initials: 'DA',
    email: '',
  },
  {
    id: 's8', section: 'network',
    name: 'Rice University Alumni', title: 'BSEE alumni network', company: 'Houston area',
    degree: '2nd', verified: true,
    why: 'Rice alumni in Houston tech and FSI are an underused asset. Many are at JPMC Plano, Fidelity Westlake, and energy-adjacent tech firms.',
    tip: 'Also check Rice alumni portal — engineering alumni chapters have job boards',
    url: 'https://www.linkedin.com/search/results/people/?network=%5B%22F%22%5D&keywords=Rice+University+Houston+technology',
    color: '#1c1917', initials: 'RI',
    email: '',
  },
]

const BLANK_CONTACT = {
  section: 'recruiters', name: '', title: '', company: '',
  degree: '2nd', verified: false,
  why: '', tip: '', url: '', email: '',
  color: '#0d9488', initials: '',
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function save(contacts) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts)) } catch {}
}

function getInitials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
}

const COLORS = ['#0d9488','#0369a1','#065f46','#92400e','#7c3aed','#be185d','#0c4a6e','#1c1917','#b45309','#0891b2']

// ContactForm lifted outside LinkedInPage to prevent remount on every keystroke
function ContactForm({ sectionId, editing, form, ff, saveContact, cancelForm, SECTIONS }) {
  return (
    <div style={{
      border: '1px solid var(--accent)', borderRadius: 'var(--radius-lg)',
      padding: 16, background: 'rgba(0,212,170,0.04)', marginBottom: 8,
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 12 }}>
        {editing ? 'Edit contact' : 'Add contact'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        {[
          ['Name *', 'name', 'text', 'e.g. Cole Withers'],
          ['Title', 'title', 'text', 'e.g. Technical Recruiter'],
          ['Company *', 'company', 'text', 'e.g. Kforce'],
          ['Email', 'email', 'email', 'e.g. cwithers@kforce.com'],
        ].map(([label, key, type, ph]) => (
          <div key={key}>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>{label}</div>
            <input type={type} placeholder={ph} value={form[key] || ''}
              onChange={e => ff(key, e.target.value)}
              style={{ width: '100%', fontSize: 11 }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>Connection degree</div>
          <select value={form.degree || '2nd'} onChange={e => ff('degree', e.target.value)} style={{ width: '100%', fontSize: 11 }}>
            {['1st','2nd','3rd','Search'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>Section</div>
          <select value={form.section || sectionId} onChange={e => ff('section', e.target.value)} style={{ width: '100%', fontSize: 11 }}>
            {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label.split(' — ')[0]}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>LinkedIn URL</div>
        <input type="url" placeholder="https://www.linkedin.com/in/..." value={form.url || ''}
          onChange={e => ff('url', e.target.value)} style={{ width: '100%', fontSize: 11 }} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>Why reach out</div>
        <textarea rows={2} placeholder="Why this person matters to your search..."
          value={form.why || ''} onChange={e => ff('why', e.target.value)}
          style={{ width: '100%', fontSize: 11, resize: 'vertical' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>Tip / action</div>
        <input type="text" placeholder="e.g. Email first, then connect on LinkedIn"
          value={form.tip || ''} onChange={e => ff('tip', e.target.value)}
          style={{ width: '100%', fontSize: 11 }} />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-sm" onClick={cancelForm}>Cancel</button>
        <button className="btn btn-sm btn-accent" onClick={saveContact}
          disabled={!form.name?.trim() || !form.company?.trim()}>
          <Check size={11} /> {editing ? 'Save changes' : 'Add contact'}
        </button>
      </div>
    </div>
  )
}

export default function LinkedInPage() {
  const [contacts, setContacts] = useState(() => load() || SEED_CONTACTS)
  const [editing,  setEditing]  = useState(null)   // contact id being edited
  const [adding,   setAdding]   = useState(null)    // section id for new contact
  const [form,     setForm]     = useState({})
  const [confirm,  setConfirm]  = useState(null)    // id pending delete confirm
  const [msgDraft, setMsgDraft] = useState(null)    // id showing message draft

  // Persist on every change
  useEffect(() => { save(contacts) }, [contacts])

  const ff = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const startAdd = (sectionId) => {
    setAdding(sectionId)
    setEditing(null)
    setForm({ ...BLANK_CONTACT, section: sectionId, color: COLORS[contacts.length % COLORS.length] })
  }

  const startEdit = (contact) => {
    setEditing(contact.id)
    setAdding(null)
    setForm({ ...contact })
  }

  const cancelForm = () => { setEditing(null); setAdding(null); setForm({}) }

  const saveContact = () => {
    if (!form.name?.trim()) return
    const contact = {
      ...form,
      id: editing || `c${Date.now()}`,
      initials: form.initials || getInitials(form.name),
    }
    setContacts(prev =>
      editing
        ? prev.map(c => c.id === editing ? contact : c)
        : [...prev, contact]
    )
    cancelForm()
  }

  const deleteContact = (id) => {
    setContacts(prev => prev.filter(c => c.id !== id))
    setConfirm(null)
  }

  const resetToSeed = () => {
    if (window.confirm('Reset all contacts to defaults? This removes any contacts you added.')) {
      setContacts(SEED_CONTACTS)
    }
  }

  // Simple message draft templates
  const getDraft = (c) => {
    if (c.section === 'recruiters') {
      return `Hi ${c.name.split(' ')[0]},\n\nI came across your profile through ${c.company} and wanted to connect. I'm a Senior BA/PM/QA professional with 20+ years in FSI and enterprise tech (Capco, Deloitte, JPMC) currently exploring contract and FT opportunities in Houston and remote.\n\nWould love to connect and learn about any roles you're currently working on.\n\nBest,\nGeorge Brooks\nlinkedin.com/in/ghbrooks`
    }
    if (c.section === 'managers') {
      return `Hi ${c.name.split(' ')[0]},\n\nI recently applied for the [role] position at ${c.company} and wanted to connect directly. I have [X] years of directly relevant experience in [area] and am excited about the opportunity.\n\nHappy to share more about my background if helpful.\n\nBest,\nGeorge Brooks`
    }
    return `Hi ${c.name.split(' ')[0]},\n\nGreat to reconnect — it's been a while since our time at [company]. I'm currently exploring senior BA/PM/Agile opportunities in Houston and remotely, and thought you might know of relevant openings at your current firm or in your network.\n\nWould love to catch up briefly.\n\nBest,\nGeorge`
  }



  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div className="page-title">LinkedIn Connections</div>
            <div className="page-sub">Recruiters, hiring managers, and warm intro contacts · All editable · Persists across sessions</div>
          </div>
          <button className="btn btn-sm" onClick={resetToSeed}
            style={{ fontSize: 10, color: 'var(--text3)' }}>
            Reset to defaults
          </button>
        </div>
      </div>

      {/* Hallucination warning banner */}
      <div style={{
        padding: '8px 14px', marginBottom: 16,
        background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)',
        borderRadius: 'var(--radius)', fontSize: 11, color: 'var(--warn)',
        fontFamily: 'var(--font-mono)',
      }}>
        ⚠️ Removed: Kape Kelly (TEKsystems) — hallucinated contact. Tekmetric hiring manager — not in your lead list.
        All remaining contacts are verified or explicitly marked as search targets.
      </div>

      {SECTIONS.map(section => {
        const sectionContacts = contacts.filter(c => c.section === section.id)
        const isAddingHere = adding === section.id

        return (
          <div key={section.id} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="section-label" style={{ margin: 0 }}>
                {section.icon} {section.label}
                <span style={{ marginLeft: 8, color: SECTION_COLORS[section.id] }}>
                  ({sectionContacts.length})
                </span>
              </div>
              <button
                className="btn btn-sm"
                onClick={() => isAddingHere ? cancelForm() : startAdd(section.id)}
                style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                {isAddingHere ? <><X size={10} /> Cancel</> : <><Plus size={10} /> Add</>}
              </button>
            </div>

            {isAddingHere && <ContactForm sectionId={section.id} editing={editing} form={form} ff={ff} saveContact={saveContact} cancelForm={cancelForm} SECTIONS={SECTIONS} />}

            <div className="li-grid">
              {sectionContacts.length === 0 && !isAddingHere && (
                <div style={{
                  padding: '12px 16px', borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--border)', color: 'var(--text3)',
                  fontSize: 11, textAlign: 'center',
                }}>
                  No contacts yet — click Add to add one
                </div>
              )}

              {sectionContacts.map(c => {
                const isEditingThis = editing === c.id
                const isConfirming  = confirm  === c.id
                const isShowingMsg  = msgDraft === c.id

                if (isEditingThis) return (
                  <div key={c.id}><ContactForm sectionId={c.section} editing={editing} form={form} ff={ff} saveContact={saveContact} cancelForm={cancelForm} SECTIONS={SECTIONS} /></div>
                )

                return (
                  <div key={c.id} className="li-card" style={{
                    border: c.verified
                      ? '1px solid var(--border)'
                      : '1px dashed var(--border)',
                    opacity: c.verified ? 1 : 0.85,
                  }}>
                    {/* Avatar */}
                    <div className="li-avatar" style={{ background: c.color + '22', color: c.color }}>
                      {c.initials || getInitials(c.name)}
                    </div>

                    {/* Body */}
                    <div className="li-body">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="li-name">{c.name}</span>
                          <span className={`deg-badge deg-${c.degree === '1st' ? 1 : 2}`}>
                            {c.degree}
                          </span>
                          {c.verified
                            ? <span style={{ fontSize: 9, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>✓ verified</span>
                            : <span style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>search target</span>}
                        </div>
                        {/* Edit / Delete controls */}
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            onClick={() => startEdit(c)}
                            title="Edit"
                            style={{ background:'none', border:'none', cursor:'pointer', padding:'2px 4px', color:'var(--text3)', borderRadius:4 }}
                          >
                            <Pencil size={11} />
                          </button>
                          {isConfirming ? (
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                              <span style={{ fontSize: 10, color: 'var(--danger)' }}>Remove?</span>
                              <button onClick={() => deleteContact(c.id)}
                                style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:4, padding:'1px 6px', fontSize:10, color:'var(--danger)', cursor:'pointer' }}>
                                Yes
                              </button>
                              <button onClick={() => setConfirm(null)}
                                style={{ background:'none', border:'1px solid var(--border)', borderRadius:4, padding:'1px 6px', fontSize:10, color:'var(--text3)', cursor:'pointer' }}>
                                No
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirm(c.id)} title="Remove"
                              style={{ background:'none', border:'none', cursor:'pointer', padding:'2px 4px', color:'var(--text3)', borderRadius:4 }}>
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="li-title">{c.title} · {c.company}</div>
                      {c.email && (
                        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent2)', marginTop: 2 }}>
                          ✉ {c.email}
                        </div>
                      )}

                      <div className="li-why">
                        {c.why}
                        {c.tip && <em style={{ color: 'var(--text3)', display: 'block', marginTop: 4 }}>💡 {c.tip}</em>}
                      </div>

                      <div className="li-actions" style={{ flexWrap: 'wrap' }}>
                        {c.url && (
                          <a href={c.url} target="_blank" rel="noopener noreferrer">
                            <button className="btn btn-sm btn-blue" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <ExternalLink size={10} /> Open LinkedIn
                            </button>
                          </a>
                        )}
                        <button
                          className="btn btn-sm"
                          onClick={() => setMsgDraft(isShowingMsg ? null : c.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          {isShowingMsg ? <><X size={10} /> Hide draft</> : '✍ Draft message'}
                        </button>
                      </div>

                      {/* Message draft */}
                      {isShowingMsg && (
                        <div style={{ marginTop: 10 }}>
                          <textarea
                            defaultValue={getDraft(c)}
                            rows={7}
                            style={{
                              width: '100%', fontSize: 11, fontFamily: 'var(--font-mono)',
                              background: 'var(--bg)', border: '1px solid var(--border)',
                              borderRadius: 'var(--radius)', padding: '8px 10px',
                              color: 'var(--text2)', resize: 'vertical', lineHeight: 1.6,
                            }}
                          />
                          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
                            Edit above then copy — placeholder text in [brackets] needs filling in
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
