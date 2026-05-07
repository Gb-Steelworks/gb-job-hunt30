// /api/upload-resume.js  — Vercel serverless function
// Receives a .docx file and commits it to GitHub /public/resumes/
// Requires env vars:
//   GITHUB_TOKEN       — Personal Access Token (repo scope)
//   GITHUB_OWNER       — e.g. "Gb-Steelworks"
//   GITHUB_REPO        — e.g. "gb-job-hunt30"
 
export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };
 
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  const { filename, content } = req.body; // content = base64 string
  if (!filename || !content) return res.status(400).json({ error: 'filename and content required' });
  if (!filename.endsWith('.docx')) return res.status(400).json({ error: 'Only .docx files allowed' });
 
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;
  if (!GITHUB_TOKEN) return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });
 
  const path = `public/resumes/${filename}`;
  const apiBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
 
  // Check if file already exists (need its SHA to overwrite)
  let sha = undefined;
  try {
    const check = await fetch(apiBase, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    if (check.ok) {
      const existing = await check.json();
      sha = existing.sha;
    }
  } catch (_) {}
 
  const body = {
    message: sha ? `chore: replace resume ${filename}` : `chore: add resume ${filename}`,
    content, // already base64
    ...(sha ? { sha } : {})
  };
 
  const put = await fetch(apiBase, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
 
  if (!put.ok) {
    const err = await put.text();
    return res.status(500).json({ error: 'GitHub API error', detail: err });
  }
 
  return res.status(200).json({ ok: true, action: sha ? 'replaced' : 'added', filename });
}
