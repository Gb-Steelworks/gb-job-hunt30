// ResumeVaultPage.jsx
// Drop into src/pages/ — matches your existing CSS variables, card, btn, table patterns exactly

import { useState, useRef } from 'react'
import { Download, Upload, FileText, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'

const VARIANTS = [
  {
    id: 'fsi',
    label: 'FSI / Banking',
    file: 'George_Brooks_Resume_FSI.docx',
    accent: 'var(--accent2)',
    bestFor: 'JPMC · Wells Fargo · USAA · Schwab · Fidelity · Frost Bank',
    categories: ['FSI', 'Banking'],
    desc: 'Leads with regulatory compliance, MRA controls, $10M risk mitigation, mobile banking delivery.',
    versions: [{ v: 'v1', date: 'May 4 2026', active: true }],
  },
  {
    id: 'consulting',
    label: 'Consulting',
    file: 'George_Brooks_Resume_Consulting.docx',
    accent: 'var(--success)',
    bestFor: 'Capco · Slalom · West Monroe · Deloitte · Pariveda',
    categories: ['Consulting'],
    desc: 'Leads with CoE development, Big Four credibility, thought leadership, client delivery methodology.',
    versions: [{ v: 'v1', date: 'May 4 2026', active: true }],
  },
  {
    id: 'pm',
    label: 'Project / Product Mgmt',
    file: 'George_Brooks_Resume_PM_Product.docx',
    accent: 'var(--accent)',
    bestFor: 'PM · Product Owner · Scrum Master · Agile PM',
    categories: ['PM', 'Agile'],
    desc: 'Leads with Product Owner titles, backlog governance, roadmap ownership, SAFe POPM cert.',
    versions: [{ v: 'v1', date: 'May 4 2026', active: true }],
  },
  {
    id: 'qa',
    label: 'Testing / QA',
    file: 'George_Brooks_Resume_Testing_QA.docx',
    accent: 'var(--warn)',
    bestFor: 'Manual QA · QA Lead · QA Director · SDLC Governance',
    categories: ['QA'],
    desc: 'Leads with test strategy, SDLC standards, defect escape rates, QA CoE, AI-augmented testing.',
    versions: [{ v: 'v1', date: 'May 4 2026', active: true }],
  },
  {
    id: 'delivery',
    label: 'Delivery Management',
    file: 'George_Brooks_Resume_Delivery_Management.docx',
    accent: '#fb923c',
    bestFor: 'Delivery Manager · PMO · Program Manager · Portfolio',
    categories: ['Delivery', 'PMO'],
    desc: 'Leads with PMO governance, multi-stream delivery, RAID logs, release governance, end-to-end ownership.',
    versions: [{ v: 'v1', date: 'May 4 2026', active: true }],
  },
]

export default function ResumeVaultPage() {
  const [expanded, setExpanded] = useState(null)
  const [uploadTarget, setUploadTarget] = useState(null)
  const fileRef = useRef()

  const handleUpload = (id) => {
    setUploadTarget(id)
    fileRef.current?.click()
  }

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (f && uploadTarget) {
      alert(`"${f.name}" uploaded for ${uploadTarget} variant. Wire this to your storage or Supabase bucket.`)
    }
    e.target.value = ''
    setUploadTarget(null)
  }

  return (
    <div className="page">
      <input ref={fileRef} type="file" accept=".docx" hidden onChange={handleFile} />

      <div className="page-header">
        <div className="page-title">Resume Vault</div>
        <div className="page-sub">5 ATS-ready variants · Each tuned for a specific role category · Master resume never sent directly</div>
      </div>

      {/* Info banner */}
      <div className="card" style={{ marginBottom: 20, background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.2)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <CheckCircle size={15} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text)' }}>15-year window enforced</strong> — all variants show 2009–present only. Months hidden (years only). No gap dates visible.
            &nbsp;·&nbsp; <strong style={{ color: 'var(--text)' }}>Certs:</strong> PMP Expected May 2026 · AWS AI Foundational Expected July 2026
            &nbsp;·&nbsp; When Agent 3 fires, it picks the best variant as the base — never sends the master resume.
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
        {VARIANTS.map(v => (
          <div key={v.id} className="card" style={{ borderLeft: `3px solid ${v.accent}`, padding: 0, overflow: 'hidden' }}>
            {/* Card header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{v.label}</div>
                <span style={{
                  fontSize: 9, fontFamily: 'var(--font-mono)', padding: '2px 8px',
                  background: 'var(--bg3)', color: 'var(--text3)', borderRadius: 20,
                }}>
                  {v.versions.find(x => x.active)?.v}
                </span>
              </div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text3)', marginBottom: 8 }}>
                {v.file}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 10 }}>
                {v.desc}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                Best for: <span style={{ color: v.accent }}>{v.bestFor}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, padding: '10px 16px', alignItems: 'center' }}>
              <a href={`/resumes/${v.file}`} download style={{ textDecoration: 'none', flex: 1 }}>
                <button className="btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <Download size={11} /> Download
                </button>
              </a>
              <button
                className="btn"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                onClick={() => handleUpload(v.id)}
              >
                <Upload size={11} /> Replace
              </button>
              <button
                className="btn"
                style={{ padding: '6px 8px' }}
                onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                title="Version history"
              >
                {expanded === v.id ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            </div>

            {/* Version history (expandable) */}
            {expanded === v.id && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '10px 16px', background: 'var(--bg3)' }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>Version history</div>
                {v.versions.map(ver => (
                  <div key={ver.v} style={{ display: 'flex', gap: 10, fontSize: 11, padding: '3px 0', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', minWidth: 24 }}>{ver.v}</span>
                    <span style={{ color: 'var(--text3)' }}>{ver.date}</span>
                    {ver.active && (
                      <span style={{ fontSize: 9, background: 'rgba(62,207,142,0.12)', color: 'var(--success)', border: '1px solid rgba(62,207,142,0.25)', borderRadius: 10, padding: '1px 7px', marginLeft: 'auto' }}>
                        current
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Variant matching guide */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-title">Auto-matching guide — Agent 3 uses this to pick the right variant</div>
        <div className="table-wrap" style={{ marginTop: 0 }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 160 }}>Role keywords</th>
                <th style={{ width: 160 }}>Variant selected</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['QA · Testing · SDLC · Defect', 'Testing / QA', 'Defect escape rates, QA CoE, Selenium, AI-augmented testing leads'],
                ['FSI · Bank · Financial · USAA · Frost · JPMC', 'FSI / Banking', 'Regulatory, MRA controls, mobile banking, $10M risk mitigation leads'],
                ['Product · Owner · Scrum · Backlog · Roadmap', 'Project / Product Mgmt', 'SAFe POPM, backlog governance, stakeholder management leads'],
                ['Consult · Advisory · Big 4 · Slalom · Deloitte', 'Consulting', 'CoE development, thought leadership, client delivery method leads'],
                ['PMO · Delivery · Program · Portfolio · Release', 'Delivery Management', 'RAID logs, multi-stream delivery, release governance leads'],
              ].map(([kw, variant, notes]) => (
                <tr key={kw}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)' }}>{kw}</td>
                  <td style={{ fontWeight: 500, color: 'var(--text)' }}>{variant}</td>
                  <td style={{ fontSize: 11, color: 'var(--text3)' }}>{notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Helper exported for Agent 3 / RoleActionPanel to call
export function suggestVariant(roleText = '') {
  const t = roleText.toLowerCase()
  if (t.includes('qa') || t.includes('test') || t.includes('sdlc')) return 'qa'
  if (t.includes('fsi') || t.includes('bank') || t.includes('financ') || t.includes('usaa') || t.includes('frost')) return 'fsi'
  if (t.includes('product') || t.includes('owner') || t.includes('scrum') || t.includes('backlog')) return 'pm'
  if (t.includes('consult') || t.includes('advisory') || t.includes('deloitte') || t.includes('slalom')) return 'consulting'
  if (t.includes('deliver') || t.includes('pmo') || t.includes('program') || t.includes('portfolio')) return 'delivery'
  return 'pm'
}
