// src/pages/ResumeVaultPage.jsx
// Resume Vault — drag & drop upload, IndexedDB primary storage, GitHub background sync
// suggestVariant exported for RoleActionPanel

import { useState, useRef, useEffect, useCallback } from 'react'
import { Upload, Download, FileText, CheckCircle, AlertCircle, Loader, RefreshCw } from 'lucide-react'

// ─── suggestVariant — exported for RoleActionPanel ────────────────────────────
export function suggestVariant(roleText) {
  const t = roleText.toLowerCase()
  if (t.includes('qa') || t.includes('test') || t.includes('quality')) return 'qa'
  if (t.includes('fsi') || t.includes('banking') || t.includes('financial')) return 'fsi'
  if (t.includes('product') || t.includes('owner') || t.includes('scrum')) return 'pm'
  if (t.includes('consult') || t.includes('deloitte') || t.includes('capco') || t.includes('kpmg') || t.includes('ey') || t.includes('accenture')) return 'consulting'
  if (t.includes('delivery') || t.includes('program') || t.includes('pmo')) return 'delivery'
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
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror   = (e) => reject(e.target.error)
  })
}

async function dbSave(id, data) {
  const db   = await openDB()
  const tx   = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  store.put({ id, ...data, saved_at: new Date().toISOString() })
  return new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej })
}

async function dbGet(id) {
  const db   = await openDB()
  const tx   = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  return new Promise((res, rej) => {
    const req = store.get(id)
    req.onsuccess = () => res(req.result || null)
    req.onerror   = () => rej(req.error)
  })
}

async function dbGetAll() {
  const db   = await openDB()
  const tx   = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  return new Promise((res, rej) => {
    const req = store.getAll()
    req.onsuccess = () => res(req.result || [])
    req.onerror   = () => rej(req.error)
  })
}

// ─── Variants config ──────────────────────────────────────────────────────────
const VARIANTS = [
  { id: 'consulting', label: 'Consulting',          file: 'George_Brooks_Resume_Consulting.docx',          accent: 'var(--success)',  bestFor: 'Deloitte, Accenture, KPMG, EY, Slalom, Capco' },
  { id: 'fsi',        label: 'FSI / Banking',        file: 'George_Brooks_Resume_FSI.docx',                 accent: 'var(--accent2)',  bestFor: 'JPMC, Wells Fargo, USAA, Schwab, Fidelity, Frost Bank' },
  { id: 'pm',         label: 'PM / Product',         file: 'George_Brooks_Resume_PM_Product.docx',          accent: 'var(--accent)',   bestFor: 'Agile PM, Product Owner, Scrum Master roles' },
  { id: 'qa',         label: 'Testing / QA',         file: 'George_Brooks_Resume_Testing_QA.docx',          accent: 'var(--warn)',     bestFor: 'Manual QA, Test Lead, QA Director roles' },
  { id: 'delivery',   label: 'Delivery Management',  file: 'George_Brooks_Resume_Delivery_Management.docx', accent: '#fb923c',         bestFor: 'PMO, Program Manager, Delivery Lead, RTE' },
]

export default function ResumeVaultPage() {
  const [vaultState, setVaultState]   = useState({}) // id → { status, saved_at, size, inGitHub }
  const [uploading, setUploading]     = useState({}) // id → bool
  const [dragOver, setDragOver]       = useState(null)
  const [toast, setToast]             = useState(null)
  const fileInputRefs                 = useRef({})

  // Load IndexedDB state on mount
  useEffect(() => {
    dbGetAll().then(records => {
      const state = {}
      records.forEach(r => { state[r.id] = { status: 'local', saved_at: r.saved_at, size: r.size } })
      setVaultState(state)
    }).catch(() => {})
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Upload handler ────────────────────────────────────────────────────────
  const handleFile = useCallback(async (variantId, file) => {
    if (!file) return
    if (!file.name.endsWith('.docx')) {
      showToast('Only .docx files are supported', 'error')
      return
    }

    setUploading(u => ({ ...u, [variantId]: true }))

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      const base64      = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

      // 1. Save to IndexedDB immediately
      await dbSave(variantId, {
        filename: VARIANTS.find(v => v.id === variantId)?.file || file.name,
        base64,
        size: file.size,
        original_name: file.name,
      })

      setVaultState(s => ({
        ...s,
        [variantId]: { status: 'local', saved_at: new Date().toISOString(), size: file.size }
      }))
      showToast(`✓ ${VARIANTS.find(v => v.id === variantId)?.label} saved to browser storage`)

      // 2. Push to GitHub in background
      const variant = VARIANTS.find(v => v.id === variantId)
      pushToGitHub(variant.file, base64)
        .then(() => {
          setVaultState(s => ({ ...s, [variantId]: { ...s[variantId], inGitHub: true } }))
          showToast(`☁️ ${variant.label} synced to GitHub`)
        })
        .catch(err => {
          // GitHub sync failed — local save still succeeded
          console.warn('GitHub sync failed:', err.message)
        })

    } catch (err) {
      showToast(`Upload failed: ${err.message}`, 'error')
    }

    setUploading(u => ({ ...u, [variantId]: false }))
  }, [])

  // ── GitHub push ───────────────────────────────────────────────────────────
  const pushToGitHub = async (filename, base64) => {
    const res = await fetch('/api/upload-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, content: base64 }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `HTTP ${res.status}`)
    }
    return res.json()
  }

  // ── Download — IndexedDB first, GitHub fallback ───────────────────────────
  const [downloading, setDownloading] = useState({})

  const downloadLocal = async (variantId) => {
    setDownloading(d => ({ ...d, [variantId]: true }))
    const vInfo = VARIANTS.find(v => v.id === variantId)
    try {
      const record = await dbGet(variantId)
      let base64, filename

      if (record?.base64) {
        // ✅ Found in IndexedDB — use local copy instantly
        base64   = record.base64
        filename = record.filename || vInfo.file
        showToast(`Downloading ${filename}...`)
      } else {
        // ⬇️ Not in browser — fetch from GitHub via proxy
        showToast(`Fetching from GitHub...`)
        const res = await fetch(`/api/get-resume?filename=${encodeURIComponent(vInfo.file)}`)
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || `Not found — upload the file in Resume Vault first`)
        }
        const data = await res.json()
        base64   = data.base64
        filename = vInfo.file
        // Cache it in IndexedDB for next time
        await dbSave(variantId, { filename, base64, size: Math.round(base64.length * 0.75) }).catch(() => {})
        setVaultState(s => ({ ...s, [variantId]: { ...s[variantId], status: 'local', inGitHub: true } }))
      }

      // Decode base64 → blob → download
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      const blob  = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      const url   = URL.createObjectURL(blob)
      const a     = document.createElement('a')
      a.href      = url
      a.download  = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast(`✓ ${filename} downloaded`)
    } catch (err) {
      showToast(`Download failed: ${err.message}`, 'error')
    }
    setDownloading(d => ({ ...d, [variantId]: false }))
  }

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const onDrop = (e, variantId) => {
    e.preventDefault()
    setDragOver(null)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(variantId, file)
  }

  const onDragOver = (e, variantId) => {
    e.preventDefault()
    setDragOver(variantId)
  }

  const formatSize = (bytes) => {
    if (!bytes) return ''
    return bytes > 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
      : `${Math.round(bytes / 1024)} KB`
  }

  const formatDate = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Resume Vault</div>
        <div className="page-sub">
          Drag &amp; drop your .docx files onto each variant — saved locally + synced to GitHub
        </div>
      </div>

      {/* Info banner */}
      <div style={{ padding: '10px 14px', marginBottom: 20, background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 'var(--radius)', fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--font-mono)', lineHeight: 1.7 }}>
        Files save instantly to your browser (IndexedDB). GitHub sync happens in the background — works even without a GitHub token.
        The ATS Optimizer pulls from browser storage first, then falls back to GitHub.
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {VARIANTS.map(v => {
          const state    = vaultState[v.id]
          const isUpload = uploading[v.id]
          const isDrag   = dragOver === v.id
          const hasFile  = !!state

          return (
            <div
              key={v.id}
              className="card"
              onDrop={e => onDrop(e, v.id)}
              onDragOver={e => onDragOver(e, v.id)}
              onDragLeave={() => setDragOver(null)}
              style={{
                border: isDrag
                  ? `2px dashed ${v.accent}`
                  : hasFile
                  ? `1px solid ${v.accent}40`
                  : '1px solid var(--border)',
                background: isDrag ? `${v.accent}08` : 'var(--bg2)',
                transition: 'border-color .15s, background .15s',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                {/* Left: info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.accent, flexShrink: 0 }} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{v.label}</div>
                    {hasFile && (
                      <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: 10, background: `${v.accent}15`, color: v.accent, border: `1px solid ${v.accent}30` }}>
                        {state.inGitHub ? '☁️ synced' : '💾 local'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
                    {v.file}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: hasFile ? 8 : 0 }}>
                    Best for: {v.bestFor}
                  </div>

                  {hasFile && (
                    <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)', display: 'flex', gap: 12 }}>
                      {state.size && <span>{formatSize(state.size)}</span>}
                      {state.saved_at && <span>Uploaded {formatDate(state.saved_at)}</span>}
                    </div>
                  )}

                  {isDrag && (
                    <div style={{ fontSize: 12, color: v.accent, fontWeight: 600, marginTop: 6 }}>
                      Drop to upload →
                    </div>
                  )}
                </div>

                {/* Right: actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                  <button
                    onClick={() => downloadLocal(v.id)}
                    disabled={downloading[v.id]}
                    title={hasFile ? 'Download from browser storage' : 'Download from GitHub'}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: downloading[v.id] ? 'var(--accent2)' : 'var(--text2)', fontSize: 11, cursor: downloading[v.id] ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', opacity: downloading[v.id] ? 0.7 : 1 }}
                  >
                    {downloading[v.id]
                      ? <><Loader size={11} style={{ animation: 'spin .8s linear infinite' }} /> Downloading...</>
                      : <><Download size={12} /> Download</>}
                  </button>

                  {/* Hidden file input */}
                  <input
                    ref={el => fileInputRefs.current[v.id] = el}
                    type="file"
                    accept=".docx"
                    style={{ display: 'none' }}
                    onChange={e => handleFile(v.id, e.target.files[0])}
                  />

                  <button
                    onClick={() => fileInputRefs.current[v.id]?.click()}
                    disabled={isUpload}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 12px',
                      background: hasFile ? 'var(--bg3)' : v.accent,
                      border: hasFile ? `1px solid ${v.accent}50` : 'none',
                      borderRadius: 'var(--radius)',
                      color: hasFile ? v.accent : '#000',
                      fontSize: 12, fontWeight: 600, cursor: isUpload ? 'not-allowed' : 'pointer',
                      opacity: isUpload ? 0.7 : 1,
                      fontFamily: 'var(--font)',
                    }}
                  >
                    {isUpload
                      ? <><Loader size={12} style={{ animation: 'spin .8s linear infinite' }} /> Saving...</>
                      : hasFile
                      ? <><RefreshCw size={12} /> Replace</>
                      : <><Upload size={12} /> Upload .docx</>}
                  </button>
                </div>
              </div>

              {/* Drop zone hint when empty */}
              {!hasFile && !isDrag && (
                <div style={{ marginTop: 12, padding: '16px', border: '1.5px dashed var(--border)', borderRadius: 'var(--radius)', textAlign: 'center', color: 'var(--text3)', fontSize: 11 }}>
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
          position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
          padding: '10px 16px', borderRadius: 'var(--radius)', fontSize: 12, fontWeight: 600,
          background: toast.type === 'error' ? 'rgba(248,113,113,0.15)' : 'rgba(62,207,142,0.15)',
          color: toast.type === 'error' ? 'var(--danger)' : 'var(--success)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(248,113,113,0.3)' : 'rgba(62,207,142,0.3)'}`,
          maxWidth: 320,
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
