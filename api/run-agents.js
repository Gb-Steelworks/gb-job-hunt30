// api/run-agents.js
// Vercel cron job — runs both memory-based agents daily at 8 AM CT
// Add to vercel.json: { "crons": [{ "path": "/api/run-agents", "schedule": "0 13 * * 1,3,5" }] }
// Runs Mon/Wed/Fri at 8 AM CT (13:00 UTC)
 
const GEORGE_PROFILE = `Candidate: George Brooks, Houston TX
Target roles: Business Analyst, Agile PM, Scrum Master, QA Lead/Director, Product Owner
Work preference: Remote first, Houston TX hybrid acceptable, Dallas/Austin considered
Contract ($55-85/hr) or Full-Time ($110-140K) — needs role by June 10, 2026
Background: 20+ years FSI, federal govt, enterprise tech
Key employers: JPMC, Capco, Deloitte, Makpar/IRS
Certs: CSM, SAFe POPM, PMP, Azure, Gen AI`
 
const SYSTEM_A1 = `You are a job search agent. Generate 8-10 realistic current job leads from staffing firms for this candidate. Firms: TekSystems, Kforce, Judge Group, Insight Global, Apex, CyberCoders, Robert Half. Locations: Houston TX, Dallas TX, Austin TX, Remote. Return ONLY a valid JSON array. Each object: { "role_title": string, "company": string, "via": string, "category": "QA"|"BA"|"PM"|"Consulting", "type": "Contract"|"Full-Time"|"Contract-to-Hire", "work_model": "Remote"|"Hybrid"|"On-site", "location": string, "pay_rate": string, "days_posted": null, "match_score": number, "contact_name": string, "contact_email": string, "apply_link": string, "notes": string } match_score 75-98.`
 
const SYSTEM_A2 = `You are a job search agent. Generate 8-10 realistic current job leads from FSI and consulting firms for this candidate. Firms: Capco, Deloitte, KPMG, EY, Accenture, Slalom, West Monroe, Pariveda, JPMC, Wells Fargo, USAA, Harris County, City of Houston. Return ONLY a valid JSON array with same schema as Agent 1. match_score 75-98. Prioritize consulting roles — candidate has Capco (2021-24) and Deloitte (2011-14) returnee advantage.`
 
async function runAgent(system, userMessage, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })
 
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'API error')
 
  const text = (data.content || [])
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
    .trim()
 
  const clean = text.replace(/```json|```/g, '').trim()
  const start = clean.indexOf('[')
  const end = clean.lastIndexOf(']')
  if (start === -1 || end === -1) return []
  try { return JSON.parse(clean.slice(start, end + 1)) } catch { return [] }
}
 
async function sendEmailDigest(leads, sendgridKey) {
  if (!sendgridKey || leads.length === 0) return
 
  const rows = leads.map(l =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${l.role_title}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${l.company}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${l.work_model}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${l.pay_rate}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${l.match_score}%</td>
      <td style="padding:8px;border-bottom:1px solid #eee"><a href="${l.apply_link}">Apply</a></td>
    </tr>`
  ).join('')
 
  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sendgridKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: 'ghbrooks4@gmail.com' }] }],
      from: { email: 'noreply@gb-job-hunt30.vercel.app', name: 'Job Hunt HQ' },
      subject: `🎯 ${leads.length} new job leads — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      content: [{
        type: 'text/html',
        value: `
          <h2 style="color:#00d4aa">Job Hunt HQ — Daily Lead Digest</h2>
          <p>${leads.length} leads found today. Deadline: June 10, 2026.</p>
          <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px">
            <thead>
              <tr style="background:#1a1a2e;color:#00d4aa">
                <th style="padding:8px;text-align:left">Role</th>
                <th style="padding:8px;text-align:left">Company</th>
                <th style="padding:8px;text-align:left">Work Model</th>
                <th style="padding:8px;text-align:left">Rate</th>
                <th style="padding:8px;text-align:left">Match</th>
                <th style="padding:8px;text-align:left">Link</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="color:#888;font-size:12px">Sent by Job Hunt HQ · gb-job-hunt30.vercel.app</p>
        `
      }]
    })
  })
}
 
export default async function handler(req, res) {
  // Allow manual trigger via GET, or cron via any method
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'No API key' })
 
  const sendgridKey = process.env.SENDGRID_API_KEY // optional
 
  try {
    const timestamp = new Date().toISOString()
    console.log(`[run-agents] Starting at ${timestamp}`)
 
    const [leads1, leads2] = await Promise.all([
      runAgent(SYSTEM_A1, `Generate job leads for:\n${GEORGE_PROFILE}\n\nReturn JSON array of 8-10 leads.`),
      runAgent(SYSTEM_A2, `Generate FSI/consulting leads for:\n${GEORGE_PROFILE}\n\nReturn JSON array of 8-10 leads.`),
    ])
 
    const allLeads = [...leads1, ...leads2].filter(l => l.role_title && l.apply_link)
    console.log(`[run-agents] Found ${allLeads.length} leads total`)
 
    // Send email digest if SendGrid key is configured
    if (sendgridKey) {
      await sendEmailDigest(allLeads, sendgridKey)
      console.log('[run-agents] Email digest sent')
    }
 
    return res.status(200).json({
      success: true,
      timestamp,
      leads_found: allLeads.length,
      agent1: leads1.length,
      agent2: leads2.length,
      email_sent: !!sendgridKey,
    })
 
  } catch (err) {
    console.error('[run-agents] Error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
