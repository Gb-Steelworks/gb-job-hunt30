// src/pages/ResumeVaultPage.jsx — v3 final
// Drag & drop upload → IndexedDB (instant) + GitHub sync (background)
// Shows live sync status: 💾 local | ☁️ synced | ⚠️ missing
// suggestVariant exported for RoleActionPanel

import { useState, useRef, useEffect, useCallback } from 'react'
import { Upload, Download, RefreshCw, Loader, CheckCircle } from 'lucide-react'

// ─── suggestVariant — exported for RoleActionPanel ────────────────────────────
export function suggestVariant(roleText) {
  const t = (roleText || '').toLowerCase()
  if (t.includes('qa') || t.includes('test') || t.includes('quality')) return 'qa'
  if (t.includes('fsi') || t.includes('banking') || t.includes('financial')) return 'fsi'
  if (t.includes('product') || t.includes('owner') || t.includes('scrum')) return 'pm'
  if (t.includes('consult') || t.includes('deloitte') || t.includes('capco') ||
      t.includes('kpmg') || t.includes('ey') || t.includes('accenture') || t.includes('slalom')) return 'consulting'
  if (t.includes('delivery') || t.includes('program') || t.includes('pmo') || t.includes('rte')) return 'delivery'
  if (t.includes('ba') || t.includes('analyst') || t.includes('business')) return 'consulting'
  return 'consulting'
}

// ─── IndexedDB helpers ────────────────────────────────────────────────────────
const DB_NAME    = 'ResumeVault'
const DB_VERSION = 1
const STORE_NAME = 'resumes'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = e => e.target.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    req.onsuccess = e => resolve(e.target.result)
    req.onerror   = e => reject(e.target.error)
  })
}

async function dbSave(id, data) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  tx.objectStore(STORE_NAME).put({ id, ...data, saved_at: new Date().toISOString() })
  return new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej })
}

async function dbGet(id) {
  const db = await openDB()
  return new Promise((res, rej) => {
    const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id)
    req.onsuccess = () => res(req.result || null)
    req.onerror   = () => rej(req.error)
  })
}

async function dbGetAll() {
  const db = await openDB()
  return new Promise((res, rej) => {
    const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll()
    req.onsuccess = () => res(req.result || [])
    req.onerror   = () => rej(req.error)
  })
}

// ─── Variant config ───────────────────────────────────────────────────────────
const VARIANTS = [
  { id: 'consulting', label: 'Consulting',         file: 'George_Brooks_Resume_Consulting.docx',          accent: 'var(--success)', bestFor: 'Deloitte, Accenture, KPMG, EY, Slalom, Capco' },
  { id: 'fsi',        label: 'FSI / Banking',       file: 'George_Brooks_Resume_FSI.docx',                 accent: 'var(--accent2)', bestFor: 'JPMC, Wells Fargo, USAA, Schwab, Fidelity, Frost Bank' },
  { id: 'pm',         label: 'PM / Product',        file: 'George_Brooks_Resume_PM_Product.docx',          accent: 'var(--accent)',  bestFor: 'Agile PM, Product Owner, Scrum Master roles' },
  { id: 'qa',         label: 'Testing / QA',        file: 'George_Brooks_Resume_Testing_QA.docx',          accent: 'var(--warn)',    bestFor: 'Manual QA, Test Lead, QA Director roles' },
  { id: 'delivery',   label: 'Delivery Management', file: 'George_Brooks_Resume_Delivery_Management.docx', accent: '#fb923c',        bestFor: 'PMO, Program Manager, Delivery Lead, RTE' },
]

// ─── Sync badge ───────────────────────────────────────────────────────────────
function SyncBadge({ state }) {
  if (!state) return (
    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', padding: '2px 7px', borderRadius: 10, background: 'rgba(107,117,145,0.15)', color: 'var(--text3)', border: '1px solid rgba(107,117,145,0.2)' }}>
      ⬜ not uploaded
    </span>
  )
  if (state.inGitHub && state.status === 'local') return (
    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', padding: '2px 7px', borderRadius: 10, background: 'rgba(62,207,142,0.12)', color: 'var(--success)', border: '1px solid rgba(62,207,142,0.25)' }}>
      ☁️ local + GitHub
    </span>
  )
  if (state.inGitHub && state.status === 'github') return (
    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', padding: '2px 7px', borderRadius: 10, background: 'rgba(59,158,255,0.12)', color: 'var(--accent2)', border: '1px solid rgba(59,158,255,0.25)' }}>
      ☁️ GitHub only
    </span>
  )
  if (state.status === 'local') return (
    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', padding: '2px 7px', borderRadius: 10, background: 'rgba(245,158,11,0.12)', color: 'var(--warn)', border: '1px solid rgba(245,158,11,0.25)' }}>
      💾 local only
    </span>
  )
  return null
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ResumeVaultPage() {
  const [vaultState, setVaultState] = useState({})
  const [uploading,  setUploading]  = useState({})
  const [downloading,setDownloading]= useState({})
  const [dragOver,   setDragOver]   = useState(null)
  const [syncing,    setSyncing]    = useState(false)
  const [toast,      setToast]      = useState(null)
  const fileInputRefs = useRef({})

  // ── On mount: load IndexedDB then check GitHub for each variant ───────────
  useEffect(() => {
    let localState = {}
    dbGetAll()
      .then(records => {
        records.forEach(r => {
          localState[r.id] = { status: 'local', saved_at: r.saved_at, size: r.size }
        })
        setVaultState(localState)
      })
      .catch(() => {})
      .finally(() => checkGitHub(localState))
  }, [])

  const checkGitHub = async (base) => {
    setSyncing(true)
    const updates = {}
    await Promise.allSettled(
      VARIANTS.map(async v => {
        try {
          const res = await fetch(`/api/get-resume?filename=${encodeURIComponent(v.file)}`)
          const existing = base[v.id] || {}
          updates[v.id] = {
            ...existing,
            inGitHub: res.ok,
            status: existing.status || (res.ok ? 'github' : 'missing'),
          }
        } catch {
          updates[v.id] = { ...(base[v.id] || {}), inGitHub: false }
        }
      })
    )
    setVaultState(s => ({ ...s, ...updates }))
    setSyncing(false)
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleFile = useCallback(async (variantId, file) => {
    if (!file) return
    if (!file.name.endsWith('.docx')) { showToast('Only .docx files are supported', 'error'); return }

    setUploading(u => ({ ...u, [variantId]: true }))
    try {
      const arrayBuffer = await file.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      const officialFilename = VARIANTS.find(v => v.id === variantId)?.file || file.name

      // 1. Save to IndexedDB immediately
      await dbSave(variantId, { filename: officialFilename, base64, size: file.size, original_name: file.name })
      setVaultState(s => ({ ...s, [variantId]: { ...s[variantId], status: 'local', saved_at: new Date().toISOString(), size: file.size } }))
      showToast(`✓ ${officialFilename} saved to browser`)

      // 2. Push to GitHub in background
      fetch('/api/upload-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: officialFilename, content: base64 }),
      })
        .then(async r => {
          if (r.ok) {
            setVaultState(s => ({ ...s, [variantId]: { ...s[variantId], inGitHub: true } }))
            showToast(`☁️ Synced to GitHub`)
          } else {
            const err = await r.json().catch(() => ({}))
            console.warn('GitHub sync failed:', err.error || r.status)
            showToast(`Saved locally — GitHub sync failed (check GITHUB_TOKEN in Vercel)`, 'warn')
          }
        })
        .catch(err => console.warn('GitHub sync error:', err.message))

    } catch (err) {
      showToast(`Upload failed: ${err.message}`, 'error')
    }
    setUploading(u => ({ ...u, [variantId]: false }))
  }, [])

  // ── Download — IndexedDB first, GitHub fallback ───────────────────────────
  const downloadFile = async (variantId) => {
    setDownloading(d => ({ ...d, [variantId]: true }))
    const vInfo = VARIANTS.find(v => v.id === variantId)
    try {
      const record = await dbGet(variantId)
      let base64, filename

      if (record?.base64) {
        base64   = record.base64
        filename = record.filename || vInfo.file
      } else {
        showToast('Fetching from GitHub...')
        const res = await fetch(`/api/get-resume?filename=${encodeURIComponent(vInfo.file)}`)
        if (!res.ok) throw new Error(`Not in GitHub yet — upload it in Resume Vault first`)
        const data = await res.json()
        base64   = data.base64
        filename = vInfo.file
        // Cache locally for next time
        await dbSave(variantId, { filename, base64, size: Math.round(base64.length * 0.75) }).catch(() => {})
        setVaultState(s => ({ ...s, [variantId]: { ...s[variantId], status: 'local', inGitHub: true } }))
      }

      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      const blob  = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      const url   = URL.createObjectURL(blob)
      const a     = document.createElement('a')
      a.href = url; a.download = filename
      document.body.appendChild(a); a.click()
      document.body.removeChild(a); URL.revokeObjectURL(url)
      showToast(`✓ ${filename} downloaded`)
    } catch (err) {
      showToast(`Download failed: ${err.message}`, 'error')
    }
    setDownloading(d => ({ ...d, [variantId]: false }))
  }

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const onDrop = (e, variantId) => { e.preventDefault(); setDragOver(null); handleFile(variantId, e.dataTransfer.files[0]) }
  const onDragOver = (e, variantId) => { e.preventDefault(); setDragOver(variantId) }

  const fmt = {
    size: b => b > 1048576 ? `${(b/1048576).toFixed(1)} MB` : `${Math.round(b/1024)} KB`,
    date: iso => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
  }

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="page-title">Resume Vault</div>
            <div className="page-sub">Drag &amp; drop .docx files — saved to browser instantly, synced to GitHub automatically</div>
          </div>
          <button
            onClick={() => checkGitHub(vaultState)}
            disabled={syncing}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text3)', fontSize: 11, cursor: syncing ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)' }}
          >
            {syncing
              ? <><Loader size={11} style={{ animation: 'spin .8s linear infinite' }} /> Checking...</>
              : <><RefreshCw size={11} /> Refresh sync status</>}
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ padding: '10px 14px', marginBottom: 20, background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.15)', borderRadius: 'var(--radius)', fontSize: 11, color: 'var(--text2)', lineHeight: 1.7 }}>
        <strong style={{ color: 'var(--accent)' }}>How it works:</strong> Upload any .docx — it saves to your browser instantly (works offline).
        GitHub sync happens in the background. Once in GitHub, your resume is accessible from any device.
        The ATS Optimizer in Prep panels pulls from browser storage first, then GitHub.
      </div>

      {/* Sync legend */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          ['☁️ local + GitHub', 'var(--success)', 'rgba(62,207,142,0.12)', 'rgba(62,207,142,0.25)', 'Saved here and in GitHub — accessible anywhere'],
          ['☁️ GitHub only',    'var(--accent2)', 'rgba(59,158,255,0.12)', 'rgba(59,158,255,0.25)', 'In GitHub but not in this browser'],
          ['💾 local only',     'var(--warn)',    'rgba(245,158,11,0.12)',  'rgba(245,158,11,0.25)', 'In this browser only — GitHub sync pending/failed'],
          ['⬜ not uploaded',   'var(--text3)',   'rgba(107,117,145,0.1)', 'rgba(107,117,145,0.2)', 'Not uploaded yet'],
        ].map(([label, color, bg, border]) => (
          <span key={label} style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '3px 8px', borderRadius: 10, background: bg, color, border: `1px solid ${border}` }}>
            {label}
          </span>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {VARIANTS.map(v => {
          const state    = vaultState[v.id]
          const isUp     = uploading[v.id]
          const isDl     = downloading[v.id]
          const isDrag   = dragOver === v.id
          const hasFile  = !!state && (state.status === 'local' || state.status === 'github' || state.inGitHub)

          return (
            <div
              key={v.id}
              onDrop={e => onDrop(e, v.id)}
              onDragOver={e => onDragOver(e, v.id)}
              onDragLeave={() => setDragOver(null)}
              style={{
                background: isDrag ? `${v.accent}0d` : 'var(--bg2)',
                border: `${isDrag ? 2 : 1}px ${isDrag ? 'dashed' : 'solid'} ${isDrag ? v.accent : hasFile ? v.accent + '40' : 'var(--border)'}`,
                borderRadius: 12, padding: 16,
                transition: 'border-color .15s, background .15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>

                {/* Left info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.accent, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{v.label}</span>
                    <SyncBadge state={state} />
                    {syncing && !state && (
                      <Loader size={10} color="var(--text3)" style={{ animation: 'spin .8s linear infinite' }} />
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{v.file}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: state ? 6 : 0 }}>Best for: {v.bestFor}</div>
                  {state?.saved_at && (
                    <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)', display: 'flex', gap: 10 }}>
                      {state.size && <span>{fmt.size(state.size)}</span>}
                      <span>Uploaded {fmt.date(state.saved_at)}</span>
                    </div>
                  )}
                  {isDrag && (
                    <div style={{ fontSize: 12, color: v.accent, fontWeight: 600, marginTop: 8 }}>Drop to upload →</div>
                  )}
                </div>

                {/* Right actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                  {/* Download button — always visible */}
                  <button
                    onClick={() => downloadFile(v.id)}
                    disabled={isDl || (!hasFile)}
                    title={hasFile ? 'Download .docx' : 'Upload first to enable download'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 10px',
                      background: 'var(--bg3)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      color: hasFile ? 'var(--text2)' : 'var(--text3)',
                      fontSize: 11, cursor: hasFile && !isDl ? 'pointer' : 'not-allowed',
                      opacity: hasFile ? 1 : 0.4,
                      fontFamily: 'var(--font)',
                    }}
                  >
                    {isDl
                      ? <><Loader size={11} style={{ animation: 'spin .8s linear infinite' }} /> Downloading...</>
                      : <>⬇ Download</>}
                  </button>

                  {/* Hidden file input */}
                  <input
                    ref={el => fileInputRefs.current[v.id] = el}
                    type="file" accept=".docx" style={{ display: 'none' }}
                    onChange={e => handleFile(v.id, e.target.files[0])}
                  />

                  {/* Upload / Replace button */}
                  <button
                    onClick={() => fileInputRefs.current[v.id]?.click()}
                    disabled={isUp}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 12px',
                      background: hasFile ? 'var(--bg3)' : v.accent,
                      border: hasFile ? `1px solid ${v.accent}60` : 'none',
                      borderRadius: 'var(--radius)',
                      color: hasFile ? v.accent : '#000',
                      fontSize: 12, fontWeight: 600,
                      cursor: isUp ? 'not-allowed' : 'pointer',
                      opacity: isUp ? 0.7 : 1,
                      fontFamily: 'var(--font)',
                    }}
                  >
                    {isUp
                      ? <><Loader size={12} style={{ animation: 'spin .8s linear infinite' }} /> Saving...</>
                      : hasFile
                      ? <><RefreshCw size={12} /> Replace</>
                      : <><Upload size={12} /> Upload .docx</>}
                  </button>
                </div>
              </div>

              {/* Drop zone hint */}
              {!hasFile && !isDrag && (
                <div style={{ marginTop: 12, padding: 14, border: '1.5px dashed var(--border)', borderRadius: 'var(--radius)', textAlign: 'center', color: 'var(--text3)', fontSize: 11 }}>
                  Drag &amp; drop your .docx here, or click Upload
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          padding: '10px 16px', borderRadius: 'var(--radius)', fontSize: 12, fontWeight: 600,
          maxWidth: 340, lineHeight: 1.5,
          background: toast.type === 'error' ? 'rgba(248,113,113,0.15)' : toast.type === 'warn' ? 'rgba(245,158,11,0.12)' : 'rgba(62,207,142,0.15)',
          color:      toast.type === 'error' ? 'var(--danger)'           : toast.type === 'warn' ? 'var(--warn)'            : 'var(--success)',
          border:     `1px solid ${toast.type === 'error' ? 'rgba(248,113,113,0.3)' : toast.type === 'warn' ? 'rgba(245,158,11,0.25)' : 'rgba(62,207,142,0.3)'}`,
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
