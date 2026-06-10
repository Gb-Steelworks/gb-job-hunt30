// api/claude.js — Vercel serverless function
// Proxies requests to Anthropic API with optional web_search tool support
// Drop into /api/claude.js in your repo
 
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
 
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  // ── Key resolution ──────────────────────────────────────────────────────────
  // Tries all three names you may have set in Vercel, in order of preference.
  const apiKey =
    process.env.ANTHROPIC_API_KEY ||
    process.env.VITE_ANTHROPIC_API_KEY ||
    process.env.CLAUDE_KEY;
 
  if (!apiKey || apiKey.trim() === '') {
    console.error('[claude.js] No API key found in environment variables.');
    return res.status(500).json({
      error: 'API key not configured. Set ANTHROPIC_API_KEY in Vercel project settings.',
      debug: {
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? 'present' : 'missing',
        VITE_ANTHROPIC_API_KEY: process.env.VITE_ANTHROPIC_API_KEY ? 'present' : 'missing',
        CLAUDE_KEY: process.env.CLAUDE_KEY ? 'present' : 'missing',
      }
    });
  }
 
  // ── Build Anthropic request ─────────────────────────────────────────────────
  const {
    model = 'claude-haiku-4-5-20251001', // ← update here when Anthropic deprecates — keep in sync with src/constants.js
    max_tokens = 4096,
    system,
    messages,
    useWebSearch = false,   // pass true from agent calls to enable live search
    tools: clientTools,     // optional: caller can pass their own tools
  } = req.body;
 
  const body = {
    model,
    max_tokens,
    messages,
  };
 
  if (system) body.system = system;
 
  // ── Web search tool ─────────────────────────────────────────────────────────
  // When useWebSearch=true (agent runs), attach the Anthropic web_search tool.
  // This makes Claude actually search job boards instead of guessing.
  const tools = [];
 
  if (useWebSearch) {
    tools.push({
      type: 'web_search_20250305',
      name: 'web_search',
    });
  }
 
  if (clientTools && Array.isArray(clientTools)) {
    tools.push(...clientTools);
  }
 
  if (tools.length > 0) body.tools = tools;
 
  // ── Call Anthropic ──────────────────────────────────────────────────────────
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.trim(),
        'anthropic-version': '2023-06-01',
        // Only send beta header when web_search tool is actually present
        ...(tools.length > 0 ? { 'anthropic-beta': 'web-search-2025-03-05' } : {}),
      },
      body: JSON.stringify(body),
    });
 
    const data = await response.json();
 
    if (!response.ok) {
      console.error('[claude.js] Anthropic API error:', data);
      return res.status(response.status).json({
        error: data.error?.message || 'Anthropic API error',
        type: data.error?.type,
        status: response.status,
      });
    }
 
    return res.status(200).json(data);
 
  } catch (err) {
    console.error('[claude.js] Fetch error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
