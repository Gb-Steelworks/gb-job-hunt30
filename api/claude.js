// v4
// api/claude.js — CommonJS format for Vercel Node runtime
// Trying to force change and new commit
//

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
 
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
 
  const apiKey = process.env.CLAUDE_KEY
 
  // Debug: return all env var keys so we can see what's available
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Missing ANTHROPIC_API_KEY',
      availableKeys: Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('TOKEN')).join(', ')
    })
  }
 
  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }
 
  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })
 
    const text = await upstream.text()
    res.setHeader('Content-Type', 'application/json')
    return res.status(upstream.status).send(text)
 
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
