// api/check-link.js
// Real HTTP link checker — does actual HEAD/GET request against each URL
// Returns { url, status, ok, redirected, finalUrl }

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

  const { url } = body
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL' })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    let response
    try {
      // Try HEAD first (faster, less bandwidth)
      response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)',
        },
        redirect: 'follow',
      })
    } catch {
      // Some servers reject HEAD — fall back to GET
      response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)',
        },
        redirect: 'follow',
      })
    }

    clearTimeout(timeout)

    const status = response.status
    const finalUrl = response.url

    // 200-399 = live, 404/410 = dead/filled, 403/429 = blocked (assume live)
    const dead = status === 404 || status === 410 || status === 301 && finalUrl.includes('404')
    const blocked = status === 403 || status === 429 || status === 503

    return res.status(200).json({
      url,
      finalUrl,
      status,
      ok: !dead,          // true = assume live, false = likely dead/filled
      blocked,            // true = site blocked checker, can't verify
      dead,
    })
  } catch (err) {
    // Network error or timeout — can't verify, assume live
    return res.status(200).json({
      url,
      status: 0,
      ok: true,
      blocked: true,
      dead: false,
      error: err.message,
    })
  }
}
