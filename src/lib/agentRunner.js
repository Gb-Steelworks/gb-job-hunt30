// agentRunner.js — drop into src/lib/agentRunner.js
// Call this from AgentsPage.jsx instead of calling claude() directly.
// Passes useWebSearch: true so the API proxy enables the live web_search tool.
 
const AGENT_1_SYSTEM = `You are a live job search agent for George Brooks, a 20+ year technology delivery professional in Houston TX.
 
George's background:
- Roles: Agile Delivery Manager, Senior Business Analyst, Project/Program Manager, QA Director
- Key employers: JPMC, Capco Consulting, Deloitte, Makpar/IRS, Supply Bistro (current)
- Certs: CSM, SAFe POPM, PMP (in progress), Azure, Gen AI, AWS AI
- Education: Rice University BSEE, Texas Southern University BS Physics, EMBA in progress
- Tools: JIRA, Confluence, Power BI, Selenium, Smartsheet, Azure DevOps
- Target: Contract ($55-85/hr) or FT ($110-140K) by June 3, 2026
- Geography: Houston TX primary, Dallas/Austin considered, Remote preferred
 
SEARCH INSTRUCTIONS:
Use web_search to find LIVE, CURRENT job postings from these staffing firms:
- TekSystems: search careers.teksystems.com and LinkedIn for TekSystems Houston TX jobs
- Kforce: search kforce.com/find-work/search-jobs for Houston and remote BA/PM roles
- Judge Group: search judge.com/jobs for Houston TX technology roles
- Insight Global: search insightglobal.com/jobs for Houston BA/PM/QA
- TEKsystems, Aerotek, Apex Group Houston technology roles
 
For each role found, return a JSON array. Each element must have these exact fields:
{
  "role_title": "exact title from job posting",
  "company": "hiring company or staffing firm + client if known",
  "via": "staffing firm name",
  "type": "Contract" | "Full-time" | "Contract-to-hire",
  "work_model": "Remote" | "Hybrid" | "Onsite",
  "location": "city, state",
  "rate": "pay rate or salary or 'Not listed'",
  "days_active": "X days ago or 'Active'",
  "match_score": number 0-100,
  "match_reason": "1-2 sentence explanation of why George fits",
  "contact_name": "recruiter name if listed, else 'Recruiter'",
  "contact_title": "Recruiter | HR | Hiring Manager",
  "contact_email": "email if available, else ''",
  "apply_link": "direct ATS or job posting URL",
  "notes": "any relevant notes"
}
 
RULES:
- Only include roles posted within the last 60 days
- Only include BA, PM, Agile, Scrum Master, QA Lead/Director, Product Owner roles
- Do not include Dice.com as an apply link — use the direct company/firm link
- Minimum match_score of 75 to include
- Return 5-10 leads maximum, prioritized by match score
- Return ONLY the JSON array, no other text`;
 
const AGENT_2_SYSTEM = `You are a live job search agent for George Brooks, a 20+ year technology delivery professional in Houston TX.
 
George's background:
- Roles: Agile Delivery Manager, Senior Business Analyst, Project/Program Manager, QA Director
- Key employers: JPMC, Capco Consulting, Deloitte, Makpar/IRS
- FSI expertise: investment banking, retail banking, regulatory compliance, mobile banking
- Certs: CSM, SAFe POPM, PMP (in progress)
- Target: Contract ($55-85/hr) or FT ($110-140K) by June 3, 2026
 
SEARCH INSTRUCTIONS:
Use web_search to find LIVE job postings at these specific firms:
- Consulting: Deloitte (jobsus.deloitte.com), Capco (capco.com/careers), KPMG, Accenture, EY GigNow, Slalom, West Monroe, Pariveda
- FSI direct: JPMC Houston, Wells Fargo Houston, USAA, Frost Bank, Schwab
- Government: City of Houston, Harris County, State of TX (CAPPS/CAPOG portals)
 
Search for: "business analyst" OR "agile delivery" OR "project manager" OR "scrum master" Houston TX OR remote 2026
 
For each role, return the same JSON structure as Agent 1.
 
RULES:
- Only roles posted within last 60 days
- Consulting roles are highest priority
- Government roles (Harris County, City of Houston) are also priority — check for deadlines
- Return ONLY the JSON array, no other text`;
 
async function callAgent(systemPrompt, agentName) {
  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Run a live job search right now. Use web_search to find real current postings. Today's date is ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Return only the JSON array of leads.`
        }
      ],
      useWebSearch: true,  // ← THIS is what enables live search in the proxy
    }),
  });
 
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || `${agentName} failed with status ${response.status}`);
  }
 
  const data = await response.json();
 
  // Extract text from all content blocks (Claude may mix text + tool_use blocks)
  const text = data.content
    ?.filter(b => b.type === 'text')
    ?.map(b => b.text)
    ?.join('') || '';
 
  // Strip markdown code fences if present
  const clean = text.replace(/```json|```/g, '').trim();
 
  // Find the JSON array
  const start = clean.indexOf('[');
  const end = clean.lastIndexOf(']');
  if (start === -1 || end === -1) throw new Error(`${agentName} returned no JSON array`);
 
  return JSON.parse(clean.slice(start, end + 1));
}
 
export async function runAgent1() {
  return callAgent(AGENT_1_SYSTEM, 'Agent 1 (Job Scout)');
}
 
export async function runAgent2() {
  return callAgent(AGENT_2_SYSTEM, 'Agent 2 (FSI & Boutique)');
}
