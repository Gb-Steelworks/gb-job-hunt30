// api/optimize-resume.js v2
// 1. Fetches the variant resume from GitHub (/public/resumes/)
// 2. Injects ATS-optimized bullets into the docx XML
// 3. Returns the file as a download
// 4. Simultaneously saves the edited file back to GitHub as a new ATS copy

const AdmZip = require('adm-zip')

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  const { bullets, role, variant } = body
  if (!bullets || !role) return res.status(400).json({ error: 'Missing bullets or role' })

  const OWNER = process.env.GITHUB_OWNER || 'Gb-Steelworks'
  const REPO  = process.env.GITHUB_REPO  || 'gb-job-hunt30'
  const TOKEN = process.env.GITHUB_TOKEN

  const VARIANT_FILES = {
    fsi:        'George_Brooks_Resume_FSI.docx',
    consulting: 'George_Brooks_Resume_Consulting.docx',
    pm:         'George_Brooks_Resume_PM_Product.docx',
    qa:         'George_Brooks_Resume_Testing_QA.docx',
    delivery:   'George_Brooks_Resume_Delivery_Management.docx',
    ba:         'George_Brooks_Resume_Consulting.docx',
  }

  const sourceFile  = VARIANT_FILES[variant] || 'George_Brooks_Resume_Consulting.docx'
  const roleSlug    = (role.role_title || 'role').replace(/[^a-zA-Z0-9\s]/g,'').trim().replace(/\s+/g,'_').slice(0,35)
  const companySlug = (role.company || 'co').replace(/[^a-zA-Z0-9\s]/g,'').trim().replace(/\s+/g,'_').slice(0,20)
  const outputFile  = `George_Brooks_Resume_${roleSlug}_${companySlug}_ATS.docx`

  try {
    // ── Step 1: Fetch source resume from GitHub ──────────────────────────────
    const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/public/resumes/${sourceFile}`
    const fileRes = await fetch(rawUrl)

    if (!fileRes.ok) {
      return res.status(404).json({
        error: `Source resume not found: ${sourceFile}. Make sure it exists in /public/resumes/ in your repo.`
      })
    }

    const arrayBuffer = await fileRes.arrayBuffer()
    const sourceBuffer = Buffer.from(arrayBuffer)

    // ── Step 2: Edit the docx ────────────────────────────────────────────────
    const editedBuffer = editDocxBullets(sourceBuffer, bullets, role, variant)

    // ── Step 3: Save to GitHub (fire-and-forget, don't block download) ───────
    if (TOKEN) {
      saveToGitHub(OWNER, REPO, TOKEN, outputFile, editedBuffer, role, variant)
        .catch(err => console.error('GitHub save failed:', err.message))
    }

    // ── Step 4: Return as download ───────────────────────────────────────────
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', `attachment; filename="${outputFile}"`)
    res.setHeader('X-Output-Filename', outputFile)
    res.setHeader('Content-Length', editedBuffer.length)
    return res.status(200).send(editedBuffer)

  } catch (err) {
    console.error('optimize-resume error:', err)
    return res.status(500).json({ error: err.message })
  }
}

// ─── Edit docx XML to inject optimized bullets ────────────────────────────────
function editDocxBullets(sourceBuffer, bulletsText, role, variant) {
  const zip = new AdmZip(sourceBuffer)
  let docXml = zip.readAsText('word/document.xml')

  const bulletLines = bulletsText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 8)
    .map(l => l.replace(/^[•●\-\*\d\.]+\s*/, '').trim())
    .filter(Boolean)

  if (bulletLines.length === 0) return sourceBuffer

  const now   = new Date().toISOString().replace(/\.\d+Z$/, 'Z')
  const label = `ATS-Optimized: ${role.role_title} @ ${role.company}`

  const headingXml = `
<w:p>
  <w:pPr>
    <w:pStyle w:val="Heading2"/>
    <w:rPr><w:ins w:id="900" w:author="ATS Optimizer" w:date="${now}"/></w:rPr>
  </w:pPr>
  <w:ins w:id="901" w:author="ATS Optimizer" w:date="${now}">
    <w:r><w:rPr><w:b/><w:caps/></w:rPr><w:t xml:space="preserve">${escapeXml(label.toUpperCase())}</w:t></w:r>
  </w:ins>
</w:p>`

  const bulletsXml = bulletLines.map((line, i) => `
<w:p>
  <w:pPr>
    <w:numPr>
      <w:ilvl w:val="0"/>
      <w:numId w:val="1"/>
    </w:numPr>
    <w:rPr><w:ins w:id="${1000 + i}" w:author="ATS Optimizer" w:date="${now}"/></w:rPr>
  </w:pPr>
  <w:ins w:id="${2000 + i}" w:author="ATS Optimizer" w:date="${now}">
    <w:r><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r>
  </w:ins>
</w:p>`).join('\n')

  // Find insertion point — try anchors in priority order
  const anchors = ['SUPPLY BISTRO', 'PROFESSIONAL EXPERIENCE', 'CORE COMPETENCIES']
  let insertAt = -1

  for (const anchor of anchors) {
    const idx = docXml.indexOf(anchor)
    if (idx !== -1) {
      const paraEnd = docXml.indexOf('</w:p>', idx)
      if (paraEnd !== -1) {
        insertAt = paraEnd + 6
        break
      }
    }
  }

  if (insertAt === -1) {
    insertAt = docXml.lastIndexOf('</w:body>')
    if (insertAt === -1) return sourceBuffer
  }

  const injected =
    docXml.slice(0, insertAt) +
    '\n' + headingXml + '\n' + bulletsXml + '\n' +
    docXml.slice(insertAt)

  zip.updateFile('word/document.xml', Buffer.from(injected, 'utf8'))
  return zip.toBuffer()
}

// ─── Save edited file to GitHub ───────────────────────────────────────────────
async function saveToGitHub(owner, repo, token, filename, buffer, role, variant) {
  const path = `public/resumes/${filename}`
  const base64Content = buffer.toString('base64')

  // Check if file already exists to get its SHA
  let sha = null
  try {
    const checkRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
    )
    if (checkRes.ok) {
      const existing = await checkRes.json()
      sha = existing.sha
    }
  } catch { /* new file, no SHA needed */ }

  const pushRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `ATS resume: ${role.role_title} @ ${role.company} (${variant})`,
        content: base64Content,
        ...(sha ? { sha } : {}),
      }),
    }
  )

  if (!pushRes.ok) {
    const err = await pushRes.json()
    throw new Error(`GitHub push failed: ${err.message}`)
  }
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
