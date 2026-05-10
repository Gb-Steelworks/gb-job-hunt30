// api/get-resume.js
// Returns a resume file as base64 — called by the frontend before optimize-resume
// Frontend passes the base64 directly so optimize-resume doesn't need to fetch it

// This endpoint is intentionally simple — it just proxies GitHub raw file fetches
// so the browser doesn't have to deal with CORS on raw.githubusercontent.com

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const { filename } = req.query
  if (!filename || !filename.endsWith('.docx')) {
    return res.status(400).json({ error: 'Invalid filename' })
  }

  const OWNER = process.env.GITHUB_OWNER || 'Gb-Steelworks'
  const REPO  = process.env.GITHUB_REPO  || 'gb-job-hunt30'
  const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/public/resumes/${filename}`

  try {
    const fileRes = await fetch(rawUrl)
    if (!fileRes.ok) {
      return res.status(404).json({ error: `File not found in GitHub: ${filename}` })
    }
    const arrayBuffer = await fileRes.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    return res.status(200).json({ filename, base64 })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
