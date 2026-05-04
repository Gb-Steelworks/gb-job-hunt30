// v5
// api/claude.js — debug version

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  // DEBUG: return all env var names so we can see what's available
  const envKeys = Object.keys(process.env).sort()
  const claudeKey = process.env.CLAUDE_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  return res.status(200).json({
    debug: true,
    CLAUDE_KEY_exists: !!claudeKey,
    CLAUDE_KEY_prefix: claudeKey ? claudeKey.substring(0, 10) : 'undefined',
    ANTHROPIC_API_KEY_exists: !!anthropicKey,
    all_env_keys: envKeys,
  })
}
