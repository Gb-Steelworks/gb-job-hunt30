import { useState, useRef } from "react";

// ─── suggestVariant — exported for use by RoleActionPanel ─────────────────
// Maps a lead category to the best-fit resume filename
export function suggestVariant(category) {
  const map = {
    QA:         "George_Brooks_Resume_Testing_QA.docx",
    BA:         "George_Brooks_Resume_FSI.docx",
    PM:         "George_Brooks_Resume_PM_Product.docx",
    consulting: "George_Brooks_Resume_Consulting.docx",
    govt:       "George_Brooks_Resume_Delivery_Management.docx",
  };
  return map[category] || "George_Brooks_Resume_PM_Product.docx";
}

// ─── Resume variants — edit this list to add/remove vault entries ──────────
const RESUME_VARIANTS = [
  {
    id: "fsi",
    label: "FSI / Banking",
    filename: "George_Brooks_Resume_FSI.docx",
    bestFor: "JPMC, Wells, USAA, Capco FSI roles",
    category: "FSI",
  },
  {
    id: "consulting",
    label: "Consulting",
    filename: "George_Brooks_Resume_Consulting.docx",
    bestFor: "Deloitte, Accenture, KPMG, EY, Slalom",
    category: "Consulting",
  },
  {
    id: "pm",
    label: "PM / Product",
    filename: "George_Brooks_Resume_PM_Product.docx",
    bestFor: "Agile PM, Product Owner, Scrum Master",
    category: "PM",
  },
  {
    id: "qa",
    label: "Testing / QA",
    filename: "George_Brooks_Resume_Testing_QA.docx",
    bestFor: "Manual QA, Test Lead, QA Director",
    category: "QA",
  },
  {
    id: "delivery",
    label: "Delivery Management",
    filename: "George_Brooks_Resume_Delivery_Management.docx",
    bestFor: "PMO, Program Manager, Delivery Lead",
    category: "PM",
  },
];

// ─── Status badge colours ──────────────────────────────────────────────────
const STATUS_STYLES = {
  idle:       { bg: "var(--color-background-secondary)", color: "var(--color-text-secondary)" },
  uploading:  { bg: "#FAEEDA", color: "#BA7517" },
  success:    { bg: "#EAF3DE", color: "#3B6D11" },
  error:      { bg: "#FCEBEB", color: "#A32D2D" },
};

function ResumeCard({ variant, onUploadComplete }) {
  const inputRef = useRef(null);
  const [status, setStatus] = useState("idle");   // idle | uploading | success | error
  const [message, setMessage] = useState("");
  const [removing, setRemoving] = useState(false);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".docx")) {
      setStatus("error");
      setMessage("Only .docx files allowed");
      return;
    }

    setStatus("uploading");
    setMessage("Uploading…");

    // Read as base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    try {
      const res = await fetch("/api/upload-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: variant.filename, content: base64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setStatus("success");
      setMessage(data.action === "replaced" ? "Replaced ✓" : "Uploaded ✓");
      onUploadComplete?.();
      setTimeout(() => { setStatus("idle"); setMessage(""); }, 3000);
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    }

    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  const badgeStyle = STATUS_STYLES[status];

  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)",
      padding: "1rem 1.25rem",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 500, fontSize: 15, color: "var(--color-text-primary)" }}>
            {variant.label}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
            {variant.bestFor}
          </div>
          <div style={{
            display: "inline-block", marginTop: 6,
            fontSize: 11, padding: "3px 8px",
            borderRadius: 4,
            background: "var(--color-background-secondary)",
            color: "var(--color-text-secondary)",
          }}>
            {variant.filename}
          </div>
        </div>
        {/* Status badge */}
        {message && (
          <div style={{
            fontSize: 12, padding: "4px 10px", borderRadius: 4,
            background: badgeStyle.bg, color: badgeStyle.color,
            whiteSpace: "nowrap",
          }}>
            {status === "uploading" && (
              <span style={{ marginRight: 6, display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
            )}
            {message}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <a
          href={`/resumes/${variant.filename}`}
          download
          style={{
            fontSize: 13, padding: "6px 14px",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: "var(--border-radius-md)",
            background: "var(--color-background-primary)",
            color: "var(--color-text-primary)",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          Download
        </a>

        <button
          onClick={() => inputRef.current?.click()}
          disabled={status === "uploading"}
          style={{
            fontSize: 13, padding: "6px 14px",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: "var(--border-radius-md)",
            background: "var(--color-background-primary)",
            color: "var(--color-text-primary)",
            cursor: status === "uploading" ? "not-allowed" : "pointer",
            opacity: status === "uploading" ? 0.6 : 1,
          }}
        >
          {variant.filename.includes("?") ? "Add file" : "Replace"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".docx"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}


// ─── Add New Resume Modal ──────────────────────────────────────────────────
function AddResumeModal({ onClose, onAdded }) {
  const inputRef = useRef(null);
  const [label, setLabel] = useState("");
  const [filename, setFilename] = useState("");
  const [bestFor, setBestFor] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "");
  }

  function handleLabelChange(e) {
    const val = e.target.value;
    setLabel(val);
    if (!filename || filename === slugify(label) + ".docx") {
      setFilename(slugify(val) + ".docx");
    }
  }

  async function handleSubmit() {
    const file = inputRef.current?.files[0];
    if (!label.trim()) { setMessage("Label required"); setStatus("error"); return; }
    if (!file) { setMessage("Select a .docx file"); setStatus("error"); return; }
    if (!file.name.endsWith(".docx")) { setMessage("Only .docx files"); setStatus("error"); return; }

    setStatus("uploading");
    setMessage("Uploading…");

    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const targetFilename = filename || slugify(label) + ".docx";

    try {
      const res = await fetch("/api/upload-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: targetFilename, content: base64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setStatus("success");
      setMessage("Added ✓  — Vercel deploys in ~60s");
      onAdded?.({ label, filename: targetFilename, bestFor });
      setTimeout(onClose, 2500);
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  const inputStyle = {
    width: "100%", fontSize: 14, padding: "8px 10px",
    border: "0.5px solid var(--color-border-secondary)",
    borderRadius: "var(--border-radius-md)",
    background: "var(--color-background-primary)",
    color: "var(--color-text-primary)",
    marginBottom: 10,
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }}>
      <div style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        padding: "1.5rem", width: 420, maxWidth: "90vw",
      }}>
        <div style={{ fontWeight: 500, fontSize: 17, marginBottom: 16 }}>Add new resume variant</div>

        <label style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Label *</label>
        <input style={inputStyle} value={label} onChange={handleLabelChange} placeholder="e.g. Agile PM — Artemis" />

        <label style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Best for</label>
        <input style={inputStyle} value={bestFor} onChange={e => setBestFor(e.target.value)} placeholder="e.g. Consulting PM roles, public sector" />

        <label style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Filename (auto-generated)</label>
        <input style={{ ...inputStyle, color: "var(--color-text-secondary)" }} value={filename} onChange={e => setFilename(e.target.value)} />

        <label style={{ fontSize: 13, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>
          .docx file *
        </label>
        <input ref={inputRef} type="file" accept=".docx" style={{ marginBottom: 16, fontSize: 13 }} />

        {message && (
          <div style={{
            fontSize: 13, padding: "8px 12px", borderRadius: 6, marginBottom: 12,
            background: STATUS_STYLES[status].bg, color: STATUS_STYLES[status].color,
          }}>{message}</div>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            fontSize: 13, padding: "7px 16px",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: "var(--border-radius-md)",
            background: "var(--color-background-secondary)",
            color: "var(--color-text-primary)", cursor: "pointer",
          }}>Cancel</button>
          <button onClick={handleSubmit} disabled={status === "uploading"} style={{
            fontSize: 13, padding: "7px 16px",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: "var(--border-radius-md)",
            background: "var(--color-background-primary)",
            color: "var(--color-text-primary)", cursor: "pointer",
          }}>Upload</button>
        </div>
      </div>
    </div>
  );
}


// ─── Main Page ─────────────────────────────────────────────────────────────
export default function ResumeVaultPage() {
  const [variants, setVariants] = useState(RESUME_VARIANTS);
  const [showAddModal, setShowAddModal] = useState(false);

  function handleAdded(newVariant) {
    setVariants(prev => [
      ...prev,
      {
        id: newVariant.filename.replace(".docx", ""),
        label: newVariant.label,
        filename: newVariant.filename,
        bestFor: newVariant.bestFor || "—",
        category: "PM",
      }
    ]);
  }

  return (
    <div style={{ padding: "1.5rem 1rem" }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 500, color: "var(--color-text-primary)" }}>Resume Vault</div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>
            {variants.length} variants · Click <strong>Replace</strong> to swap a file · Vercel redeploys in ~60s
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            fontSize: 14, padding: "8px 18px",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: "var(--border-radius-md)",
            background: "var(--color-background-primary)",
            color: "var(--color-text-primary)",
            cursor: "pointer",
          }}
        >
          + Add resume
        </button>
      </div>

      {/* Note about GitHub deployment */}
      <div style={{
        fontSize: 13, padding: "10px 14px", marginBottom: "1.5rem",
        background: "var(--color-background-secondary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-md)",
        color: "var(--color-text-secondary)",
      }}>
        Files are committed directly to GitHub (<code>public/resumes/</code>) and served as static assets via Vercel.
        After upload, the file is live in ~60 seconds. <strong>Supabase Storage migration coming soon</strong> — no changes needed on your end when that switches.
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
        {variants.map(v => (
          <ResumeCard key={v.id} variant={v} />
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddResumeModal
          onClose={() => setShowAddModal(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
}
