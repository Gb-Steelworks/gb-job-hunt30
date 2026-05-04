// RoleActionPanel.jsx
// Drop into src/components/
// Triggered by "Prep ↗" button in LeadsPage. Pass the lead object as `role` prop.
// Calls Anthropic API for ATS optimization, cover letter, Q&A.

import { useState, useEffect, useRef } from 'react'
import { X, Copy, Check, ChevronRight, Loader } from 'lucide-react'
import { suggestVariant } from '../pages/ResumeVaultPage.jsx'

const VARIANTS = [
  { id: 'fsi',      label: 'FSI / Banking',        accent: 'var(--accent2)' },
  { id: 'consulting',label: 'Consulting',           accent: 'var(--success)' },
  { id: 'pm',       label: 'Project / Product Mgmt',accent: 'var(--accent)' },
  { id: 'qa',       label: 'Testing / QA',          accent: 'var(--warn)' },
  { id: 'delivery', label: 'Delivery Management',   accent: '#fb923c' },
]

const STEPS = [
  { id: 'variant', label: 'Variant' },
  { id: 'ats',     label: 'ATS Optimize' },
  { id: 'cover',   label: 'Cover Letter' },
  { id: 'qa',      label: 'Q&A Prep' },
  { id: 'log',     label: 'Log' },
]

const GEORGE = `George Brooks — 20+ yrs technology delivery, FSI, federal govt, enterprise tech.
Roles: QA Director (Supply Bistro 2025-present), Agile Delivery Mgr/Sr BA (Capco 2021-2024),
PM Instructor (Rice/Trilogy 2021-2022), Agility Lead/PM (JPMC 2018-2019), BA/Tech Lead (Makpar/IRS 2017-2018),
Sr Integration Consultant/Delivery Mgr (Deloitte 2011-2014), Sr PM/Testing Lead (Alliance 2010),
Sr QA Cloud Tester (Keynote 2009-2011).
Certs: CSM, SAFe POPM, SAFe Lean Agile, Azure, Gen AI, PMP (exp May 2026), AWS AI (exp Jul 2026).
Tools: JIRA, Confluence, Power BI, Selenium, Smartsheet, Azure, Visio, IBM CLM.
Results: $10M+ regulatory risk mitigation, 90% faster system resolution, $200K release savings,
30% faster testing cycles, 50% faster incident resolution, 35-40% fraud reduction (IRS 651M users).`

async function claude(system, user) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.content?.map(b => b.text || '').join('') || ''
}

export default function RoleActionPanel({ role, onClose, onApplied }) {
  const [step, setStep] = useState('variant')
  const [variant, setVariant] = useState(null)
  const [jd, setJd] = useState('')
  const [jdFetching, setJdFetching] = useState(false)
  const [jdFetched, setJdFetched] = useState(false)
  const [out, setOut] = useState({ ats: '', cover: '', qa: '' })
  const [loading, setLoading] = useState({ ats: false, cover: false, qa: false })
  const [copied, setCopied] = useState(null)
  const [applied, setApplied] = useState(false)
  const overlayRef = useRef()

  useEffect(() => {
    if (role) setVariant(suggestVariant(`${role.role_title} ${role.category || ''}`))
  }, [role])

  // Auto-fetch JD when panel opens
  useEffect(() => {
    if (!role?.apply_link) return
    setJdFetching(true)
    setJdFetched(false)
    claude(
      'You are a job description extractor. Extract ONLY the job description text from the given URL — title, responsibilities, requirements, qualifications. Return plain text only. If you cannot access it, return exactly: "FETCH_FAILED"',
      `Extract the job description from this posting URL: ${role.apply_link}`
    )
      .then(text => {
        if (text && !text.includes('FETCH_FAILED') && text.length > 100) {
          setJd(text.trim())
          setJdFetched(true)
        }
      })
      .catch(() => {})
      .finally(() => setJdFetching(false))
  }, [role?.id])

  if (!role) return null

  const roleStr = `Title: ${role.role_title}\nCompany: ${role.company}\nLocation: ${role.work_model}\nType: ${role.type}\nPay: ${role.pay_rate || 'TBD'}`

  const run = async (type) => {
    setLoading(l => ({ ...l, [type]: true }))
    try {
      const jdStr = jd ? `\n\nJob Description:\n${jd}` : ''
      let result = ''
      if (type === 'ats') {
        result = await claude(
          'ATS resume expert. Rewrite bullet points to match job keywords. Be specific. Return only the bullet list. No fictional experience.',
          `Candidate:\n${GEORGE}\n\nRole:\n${roleStr}${jdStr}\n\nVariant focus: ${variant}\n\nRewrite the 10 most impactful bullets optimized for this role. Format as clean bullet list.`
        )
      } else if (type === 'cover') {
        result = await claude(
          'Expert cover letter writer for tech professionals. Write compelling, specific letters — not AI-sounding. Use concrete numbers.',
          `Write a cover letter for George Brooks applying to:\n${roleStr}${jdStr}\n\nBackground:\n${GEORGE}\n\n3 short paragraphs. Professional but human. End with a clear call to action.`
        )
      } else if (type === 'qa') {
        result = await claude(
          'Interview coach for tech PM/QA/Agile roles. Generate likely recruiter + HM questions with STAR answers tailored to the candidate.',
          `8 interview Q&As for George Brooks applying to:\n${roleStr}${jdStr}\n\nBackground:\n${GEORGE}\n\nFormat:\nQ: [question]\nA: [STAR answer, 3-4 sentences]`
        )
      }
      setOut(o => ({ ...o, [type]: result }))
    } catch (e) {
      setOut(o => ({ ...o, [type]: `Error: ${e.message}` }))
    }
    setLoading(l => ({ ...l, [type]: false }))
  }

  const copy = async (text, key) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleApply = () => {
    setApplied(true)
    onApplied?.({
      ...role,
      role_title: role.role_title,
      company: role.company,
      date_applied: new Date().toISOString().split('T')[0],
      resume_version: variant,
      cover_letter: !!out.cover,
      status: 'Applied',
      recruiter_name: role.contact_name || '',
      recruiter_email: role.contact_email || '',
    })
  }

  const stepDone = (id) => {
    if (id === 'variant') return !!variant
    if (id === 'log') return applied
    return !!out[id]
  }

  return (
    <div
      ref={overlayRef}
      onClick={e => e.target === overlayRef.current && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div style={{
        width: 'min(540px, 100vw)',
        background: 'var(--bg2)',
        height: '100vh',
        overflowY: 'auto',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg)',
          position: 'sticky', top: 0, zIndex: 5,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{role.role_title}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span>{role.company}</span>
              <span>·</span>
              <span>{role.work_model}</span>
              <span>·</span>
              <span>{role.type}</span>
              {role.pay_rate && role.pay_rate !== 'TBD' && <><span>·</span><span style={{ color: 'var(--accent)' }}>{role.pay_rate}</span></>}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Step tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          overflowX: 'auto',
        }}>
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              style={{
                flex: '1 0 auto',
                padding: '10px 8px',
                background: 'none',
                border: 'none',
                borderBottom: step === s.id ? '2px solid var(--accent)' : '2px solid transparent',
                color: step === s.id ? 'var(--accent)' : stepDone(s.id) ? 'var(--success)' : 'var(--text3)',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                background: step === s.id ? 'rgba(0,212,170,0.15)' : stepDone(s.id) ? 'rgba(62,207,142,0.15)' : 'var(--bg3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9,
              }}>
                {stepDone(s.id) ? '✓' : i + 1}
              </span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Step body */}
        <div style={{ padding: '20px', flex: 1 }}>

          {/* Step 1: Variant */}
          {step === 'variant' && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Select Resume Variant</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 14 }}>Auto-suggested based on role. Override if needed.</div>
              {VARIANTS.map(v => (
                <label key={v.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px',
                  border: `1.5px solid ${variant === v.id ? v.accent : 'var(--border)'}`,
                  borderRadius: 'var(--radius)',
                  marginBottom: 8,
                  cursor: 'pointer',
                  background: variant === v.id ? 'var(--bg3)' : 'transparent',
                  transition: 'border-color .15s',
                }}>
                  <input type="radio" name="variant" value={v.id} checked={variant === v.id} onChange={() => setVariant(v.id)} hidden />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.accent, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: variant === v.id ? 'var(--text)' : 'var(--text2)', flex: 1 }}>{v.label}</span>
                  {variant === v.id && <span style={{ fontSize: 10, color: v.accent }}>✓ selected</span>}
                </label>
              ))}
              <button className="btn btn-accent" style={{ width: '100%', marginTop: 8 }} onClick={() => setStep('ats')}>
                Next: ATS Optimize <ChevronRight size={12} />
              </button>
            </div>
          )}

          {/* Step 2: ATS */}
          {step === 'ats' && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>ATS-Optimize Resume</div>

              {/* JD fetch status banner */}
              {jdFetching && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'rgba(0,153,255,0.08)', border: '1px solid rgba(0,153,255,0.2)', borderRadius: 'var(--radius)', marginBottom: 10, fontSize: 11, color: 'var(--accent2)' }}>
                  <Loader size={11} className="spin" /> Fetching job description from posting...
                </div>
              )}
              {jdFetched && !jdFetching && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'rgba(62,207,142,0.08)', border: '1px solid rgba(62,207,142,0.2)', borderRadius: 'var(--radius)', marginBottom: 10, fontSize: 11, color: 'var(--success)' }}>
                  ✓ Job description auto-fetched — edit below if needed
                </div>
              )}
              {!jdFetching && !jdFetched && (
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>
                  Paste the job description for best keyword matching (recommended).
                </div>
              )}

              <textarea
                placeholder="Paste job description here, or wait for auto-fetch..."
                value={jd}
                onChange={e => setJd(e.target.value)}
                rows={6}
                style={{
                  width: '100%', background: 'var(--bg)', border: `1px solid ${jdFetched ? 'rgba(62,207,142,0.3)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)', color: 'var(--text)', padding: '8px 10px',
                  fontSize: 11, resize: 'vertical', marginBottom: 10, fontFamily: 'var(--font-mono)',
                }}
              />
              <button className="btn btn-accent" style={{ width: '100%', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={() => run('ats')} disabled={loading.ats || jdFetching}>
                {loading.ats ? <><Loader size={12} className="spin" /> Optimizing...</> : '✨ Optimize Bullets for This Role'}
              </button>
              {out.ats && <OutputBox text={out.ats} label="Optimized bullets" copyKey="ats" copied={copied} onCopy={copy} />}
            </div>
          )}

          {/* Step 3: Cover */}
          {step === 'cover' && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Cover Letter</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>Tailored to this specific role and company.</div>
              <button className="btn btn-accent" style={{ width: '100%', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={() => run('cover')} disabled={loading.cover}>
                {loading.cover ? <><Loader size={12} className="spin" /> Writing...</> : '✍️ Generate Cover Letter'}
              </button>
              {out.cover && <OutputBox text={out.cover} label="Cover letter" copyKey="cover" copied={copied} onCopy={copy} />}
            </div>
          )}

          {/* Step 4: Q&A */}
          {step === 'qa' && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Recruiter Q&A Prep</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>8 likely questions with STAR answers tailored to this role.</div>
              <button className="btn btn-accent" style={{ width: '100%', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={() => run('qa')} disabled={loading.qa}>
                {loading.qa ? <><Loader size={12} className="spin" /> Generating...</> : '🎤 Generate Interview Prep'}
              </button>
              {out.qa && <OutputBox text={out.qa} label="Q&A prep (8 questions)" copyKey="qa" copied={copied} onCopy={copy} />}
            </div>
          )}

          {/* Step 5: Log */}
          {step === 'log' && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Log Application</div>
              {applied ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--success)', marginBottom: 8 }}>Application logged!</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.8 }}>
                    {role.role_title} at {role.company}<br />
                    Resume variant: <span style={{ color: 'var(--accent)' }}>{variant}</span><br />
                    Date: {new Date().toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <>
                  <div className="card" style={{ padding: 0, marginBottom: 14, overflow: 'hidden' }}>
                    {[
                      ['Role', role.role_title],
                      ['Company', role.company],
                      ['Type', role.type],
                      ['Work model', role.work_model],
                      ['Resume variant', variant || '—'],
                      ['Cover letter', out.cover ? '✅ Ready' : '⬜ Not generated'],
                      ['Q&A prep', out.qa ? '✅ Ready' : '⬜ Not generated'],
                    ].map(([k, v], i, arr) => (
                      <div key={k} style={{
                        display: 'flex', justifyContent: 'space-between',
                        padding: '8px 14px',
                        borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                        fontSize: 12,
                      }}>
                        <span style={{ color: 'var(--text3)' }}>{k}</span>
                        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleApply}
                    style={{
                      width: '100%', padding: '10px',
                      background: 'rgba(62,207,142,0.15)',
                      border: '1px solid rgba(62,207,142,0.4)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--success)', fontWeight: 600, fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    🎯 Mark as Applied — Add to Applications Tracker
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin .8s linear infinite; }
      `}</style>
    </div>
  )
}

function OutputBox({ text, label, copyKey, copied, onCopy }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '6px 10px', background: 'var(--bg3)',
        borderBottom: '1px solid var(--border)',
        fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text3)',
      }}>
        <span>{label}</span>
        <button
          onClick={() => onCopy(text, copyKey)}
          style={{ background: 'none', border: 'none', color: copied === copyKey ? 'var(--success)' : 'var(--accent2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}
        >
          {copied === copyKey ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
        </button>
      </div>
      <pre style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11, lineHeight: 1.65,
        color: 'var(--text2)',
        padding: '10px 12px',
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        maxHeight: 300,
        overflowY: 'auto',
        background: 'var(--bg)',
      }}>{text}</pre>
    </div>
  )
}
