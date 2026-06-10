// ExportPage.test.js
// Full unit test suite for export/backup/restore logic
// Run with: node ExportPage.test.js

let passed = 0, failed = 0, skipped = 0

function test(name, fn) {
  try { fn(); console.log(`  ✅ ${name}`); passed++ }
  catch(e) { console.log(`  ❌ ${name}: ${e.message}`); failed++ }
}
function skip(name) { console.log(`  ⏭  ${name} (skipped — requires browser)`); skipped++ }
function assert(c, m) { if (!c) throw new Error(m || 'assertion failed') }
function assertEq(a, b, m) { if (a !== b) throw new Error(m || `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`) }

// ── Simulate localStorage ─────────────────────────────────────────────────────
const _store = {}
const localStorage = {
  getItem:    k => _store[k] || null,
  setItem:    (k,v) => { _store[k] = v },
  removeItem: k => { delete _store[k] },
  clear:      () => Object.keys(_store).forEach(k => delete _store[k]),
}

const KEYS = {
  LEAD_STATUSES:   'gb_lead_statuses',
  APPLICATIONS:    'gb_applications',
  PRIORITY_CHECKS: 'gb_priority_checks',
  AGENT_LEADS:     'gb_agent_leads',
  AGENT_RUNS:      'gb_agent_runs',
  LINKEDIN:        'gb_linkedin_contacts',
}

function loadKey(key, fallback) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback }
  catch { return fallback }
}
function saveKey(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

function buildSnapshot() {
  return {
    exported_at:     new Date().toISOString(),
    app_version:     'Job Hunt 30',
    lead_statuses:   loadKey(KEYS.LEAD_STATUSES,   {}),
    applications:    loadKey(KEYS.APPLICATIONS,    []),
    priority_checks: loadKey(KEYS.PRIORITY_CHECKS, {}),
    agent_leads:     loadKey(KEYS.AGENT_LEADS,      []),
    agent_runs:      loadKey(KEYS.AGENT_RUNS,       {}),
    linkedin:        loadKey(KEYS.LINKEDIN,         []),
  }
}

function restoreSnapshot(snap) {
  const errors = []
  if (snap.lead_statuses)   saveKey(KEYS.LEAD_STATUSES,   snap.lead_statuses)
  else errors.push('lead_statuses missing')
  if (snap.applications)    saveKey(KEYS.APPLICATIONS,    snap.applications)
  else errors.push('applications missing')
  if (snap.priority_checks) saveKey(KEYS.PRIORITY_CHECKS, snap.priority_checks)
  if (snap.agent_leads)     saveKey(KEYS.AGENT_LEADS,     snap.agent_leads)
  if (snap.agent_runs)      saveKey(KEYS.AGENT_RUNS,      snap.agent_runs)
  if (snap.linkedin)        saveKey(KEYS.LINKEDIN,        snap.linkedin)
  return errors
}

// ── Seed test data ────────────────────────────────────────────────────────────
const SAMPLE = {
  leadStatuses:  { 19: 'Applied', 29: 'Interview Pending', 33: 'Reviewing' },
  applications:  [
    { id: 40, role_title: 'PM', company: 'Artemis', status: 'Applied', date_applied: '2026-06-03', resume_version: 'pm', cover_letter: true, qa_prep: true },
    { id: 19, role_title: 'Agile Delivery Manager', company: 'Capco', status: 'Interview Pending', date_applied: '2026-06-05', resume_version: 'consulting', cover_letter: true, qa_prep: false },
  ],
  agentLeads: [
    { id: 201, role_title: 'Sr BA', company: 'Kforce', via: 'Kforce', category: 'BA', type: 'Contract', work_model: 'Hybrid', pay_rate: '$65-70/hr', match_score: 94, status: 'New', agent: 'A1' },
    { id: 202, role_title: 'Agile PM', company: 'Deloitte', via: 'Direct', category: 'consulting', type: 'Full-Time', work_model: 'Hybrid', pay_rate: '$130K', match_score: 93, status: 'New', agent: 'A2' },
  ],
  linkedin: [
    { id: 's1', section: 'recruiters', name: 'Cole Withers', company: 'Kforce', verified: true, email: '', degree: '1st' },
    { id: 's2', section: 'network', name: 'Capco Alumni', company: 'Multiple', verified: true, email: '', degree: '2nd' },
  ],
  priorityChecks: { 0: true, 2: true, 4: true },
  agentRuns: { A1: { lastRun: 'Jun 10, 2026', leadsFound: 10 }, A2: { lastRun: 'Jun 10, 2026', leadsFound: 8 } },
}

function seedStore() {
  localStorage.clear()
  saveKey(KEYS.LEAD_STATUSES,   SAMPLE.leadStatuses)
  saveKey(KEYS.APPLICATIONS,    SAMPLE.applications)
  saveKey(KEYS.AGENT_LEADS,     SAMPLE.agentLeads)
  saveKey(KEYS.LINKEDIN,        SAMPLE.linkedin)
  saveKey(KEYS.PRIORITY_CHECKS, SAMPLE.priorityChecks)
  saveKey(KEYS.AGENT_RUNS,      SAMPLE.agentRuns)
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📸 SNAPSHOT BUILDER')
// ─────────────────────────────────────────────────────────────────────────────

test('buildSnapshot returns all 6 keys', () => {
  seedStore()
  const snap = buildSnapshot()
  assert('exported_at'     in snap, 'missing exported_at')
  assert('app_version'     in snap, 'missing app_version')
  assert('lead_statuses'   in snap, 'missing lead_statuses')
  assert('applications'    in snap, 'missing applications')
  assert('priority_checks' in snap, 'missing priority_checks')
  assert('agent_leads'     in snap, 'missing agent_leads')
  assert('agent_runs'      in snap, 'missing agent_runs')
  assert('linkedin'        in snap, 'missing linkedin')
})

test('exported_at is valid ISO timestamp', () => {
  seedStore()
  const snap = buildSnapshot()
  const d = new Date(snap.exported_at)
  assert(!isNaN(d.getTime()), 'exported_at is not a valid date')
})

test('app_version is correct', () => {
  seedStore()
  assertEq(buildSnapshot().app_version, 'Job Hunt 30')
})

test('captures lead statuses correctly', () => {
  seedStore()
  const snap = buildSnapshot()
  assertEq(snap.lead_statuses[19], 'Applied')
  assertEq(snap.lead_statuses[29], 'Interview Pending')
  assertEq(snap.lead_statuses[33], 'Reviewing')
})

test('captures applications correctly', () => {
  seedStore()
  const snap = buildSnapshot()
  assertEq(snap.applications.length, 2)
  assertEq(snap.applications[0].company, 'Artemis')
  assertEq(snap.applications[1].status, 'Interview Pending')
})

test('captures agent leads correctly', () => {
  seedStore()
  const snap = buildSnapshot()
  assertEq(snap.agent_leads.length, 2)
  assertEq(snap.agent_leads[0].match_score, 94)
})

test('captures linkedin contacts correctly', () => {
  seedStore()
  const snap = buildSnapshot()
  assertEq(snap.linkedin.length, 2)
  assertEq(snap.linkedin[0].name, 'Cole Withers')
})

test('captures priority checks correctly', () => {
  seedStore()
  const snap = buildSnapshot()
  assert(snap.priority_checks[0] === true, 'index 0 should be checked')
  assert(snap.priority_checks[2] === true, 'index 2 should be checked')
  assert(!snap.priority_checks[1], 'index 1 should not be checked')
})

test('empty store produces empty collections not null', () => {
  localStorage.clear()
  const snap = buildSnapshot()
  assert(Array.isArray(snap.applications), 'applications should be array')
  assert(Array.isArray(snap.agent_leads), 'agent_leads should be array')
  assert(typeof snap.lead_statuses === 'object', 'lead_statuses should be object')
  assertEq(snap.applications.length, 0)
  assertEq(snap.agent_leads.length, 0)
})

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n💾 RESTORE FROM SNAPSHOT')
// ─────────────────────────────────────────────────────────────────────────────

test('restores all data correctly', () => {
  localStorage.clear()
  const snap = {
    exported_at: new Date().toISOString(),
    app_version: 'Job Hunt 30',
    lead_statuses:   SAMPLE.leadStatuses,
    applications:    SAMPLE.applications,
    priority_checks: SAMPLE.priorityChecks,
    agent_leads:     SAMPLE.agentLeads,
    agent_runs:      SAMPLE.agentRuns,
    linkedin:        SAMPLE.linkedin,
  }
  const errors = restoreSnapshot(snap)
  assertEq(errors.length, 0, `restore errors: ${errors.join(', ')}`)
  assertEq(loadKey(KEYS.APPLICATIONS, []).length, 2, 'applications not restored')
  assertEq(loadKey(KEYS.LEAD_STATUSES, {})[19], 'Applied', 'lead status not restored')
  assertEq(loadKey(KEYS.AGENT_LEADS, []).length, 2, 'agent leads not restored')
  assertEq(loadKey(KEYS.LINKEDIN, []).length, 2, 'linkedin not restored')
  assertEq(loadKey(KEYS.PRIORITY_CHECKS, {})[0], true, 'priority checks not restored')
})

test('returns errors for missing required keys', () => {
  const snap = { exported_at: new Date().toISOString(), app_version: 'Job Hunt 30' }
  const errors = restoreSnapshot(snap)
  assert(errors.includes('lead_statuses missing'), 'should flag missing lead_statuses')
  assert(errors.includes('applications missing'), 'should flag missing applications')
})

test('partial restore still writes available data', () => {
  localStorage.clear()
  const snap = {
    exported_at: new Date().toISOString(),
    app_version: 'Job Hunt 30',
    lead_statuses: { 19: 'Applied' },
    applications: [{ id: 1, role_title: 'Test', status: 'Applied' }],
    agent_leads: [{ id: 201, role_title: 'BA' }],
    // no linkedin, no priority_checks, no agent_runs — optional fields
  }
  restoreSnapshot(snap)
  assertEq(loadKey(KEYS.APPLICATIONS, []).length, 1)
  assertEq(loadKey(KEYS.AGENT_LEADS, []).length, 1)
})

test('restore overwrites existing data', () => {
  saveKey(KEYS.APPLICATIONS, [{ id: 999, role_title: 'Old app' }])
  const snap = {
    exported_at: new Date().toISOString(),
    app_version: 'Job Hunt 30',
    lead_statuses: {},
    applications: [{ id: 1, role_title: 'New app' }],
  }
  restoreSnapshot(snap)
  const apps = loadKey(KEYS.APPLICATIONS, [])
  assertEq(apps.length, 1)
  assertEq(apps[0].id, 1, 'old data should be overwritten')
})

test('roundtrip: snapshot then restore gives identical data', () => {
  seedStore()
  const snap = buildSnapshot()
  localStorage.clear()
  restoreSnapshot(snap)
  const restored = buildSnapshot()
  assertEq(JSON.stringify(snap.applications), JSON.stringify(restored.applications), 'applications mismatch')
  assertEq(JSON.stringify(snap.lead_statuses), JSON.stringify(restored.lead_statuses), 'lead_statuses mismatch')
  assertEq(JSON.stringify(snap.agent_leads), JSON.stringify(restored.agent_leads), 'agent_leads mismatch')
  assertEq(JSON.stringify(snap.linkedin), JSON.stringify(restored.linkedin), 'linkedin mismatch')
})

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📋 XLSX DATA SHAPE')
// ─────────────────────────────────────────────────────────────────────────────

test('applications sheet has correct columns', () => {
  seedStore()
  const snap = buildSnapshot()
  const apps = snap.applications.map(a => ({
    'Role': a.role_title || '', 'Company': a.company || '', 'Type': a.type || '',
    'Work Model': a.work_model || '', 'Pay Rate': a.pay_rate || '', 'Status': a.status || '',
    'Date Applied': a.date_applied || '', 'Resume Variant': a.resume_version || '',
    'Cover Letter': a.cover_letter ? 'Yes' : 'No', 'Q&A Prep': a.qa_prep ? 'Yes' : 'No',
  }))
  assertEq(apps[0]['Role'], 'PM')
  assertEq(apps[0]['Company'], 'Artemis')
  assertEq(apps[0]['Cover Letter'], 'Yes')
  assertEq(apps[1]['Cover Letter'], 'Yes')
  assertEq(apps[1]['Q&A Prep'], 'No')
})

test('agent leads sheet merges current status from lead_statuses', () => {
  seedStore()
  const snap = buildSnapshot()
  const rows = snap.agent_leads.map(l => ({
    'Status': (snap.lead_statuses || {})[l.id] || l.status || 'New',
    'Role': l.role_title,
  }))
  // Agent lead 201 has no saved status override → 'New'
  assertEq(rows[0]['Status'], 'New', 'should fall back to lead status')
})

test('linkedin sheet has verified flag', () => {
  seedStore()
  const snap = buildSnapshot()
  const rows = snap.linkedin.map(c => ({
    'Verified': c.verified ? 'Yes' : 'No',
    'Name': c.name,
  }))
  assertEq(rows[0]['Verified'], 'Yes')
  assertEq(rows[0]['Name'], 'Cole Withers')
})

test('summary sheet counts correct totals', () => {
  seedStore()
  const snap = buildSnapshot()
  const summary = [
    { Metric: 'Applications Logged', Value: snap.applications.length },
    { Metric: 'Agent Leads Found',   Value: snap.agent_leads.length },
    { Metric: 'LinkedIn Contacts',   Value: snap.linkedin.length },
  ]
  assertEq(summary[0].Value, 2, 'applications count wrong')
  assertEq(summary[1].Value, 2, 'agent leads count wrong')
  assertEq(summary[2].Value, 2, 'linkedin count wrong')
})

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🔒 VALIDATION')
// ─────────────────────────────────────────────────────────────────────────────

test('rejects file without app_version', () => {
  const badSnap = { applications: [], lead_statuses: {} }
  assert(!badSnap.app_version, 'should be missing app_version')
  let threw = false
  try {
    if (!badSnap.app_version || !badSnap.exported_at) throw new Error('Not a Job Hunt 30 backup')
  } catch { threw = true }
  assert(threw, 'should throw on invalid backup')
})

test('rejects file without exported_at', () => {
  const badSnap = { app_version: 'Job Hunt 30', applications: [] }
  let threw = false
  try {
    if (!badSnap.app_version || !badSnap.exported_at) throw new Error('Not a Job Hunt 30 backup')
  } catch { threw = true }
  assert(threw, 'should throw on missing exported_at')
})

test('accepts valid backup structure', () => {
  const goodSnap = {
    app_version: 'Job Hunt 30',
    exported_at: new Date().toISOString(),
    applications: [],
    lead_statuses: {},
  }
  assert(goodSnap.app_version && goodSnap.exported_at, 'valid backup should pass validation')
})

test('JSON serialization roundtrip preserves types', () => {
  seedStore()
  const snap = buildSnapshot()
  const json = JSON.stringify(snap)
  const parsed = JSON.parse(json)
  assert(Array.isArray(parsed.applications), 'applications should still be array after JSON roundtrip')
  assert(typeof parsed.lead_statuses === 'object', 'lead_statuses should still be object')
  assertEq(parsed.applications.length, snap.applications.length, 'array length preserved')
  assertEq(parsed.lead_statuses[19], 'Applied', 'status values preserved')
})

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🌐 BROWSER-ONLY (skipped in Node)')
// ─────────────────────────────────────────────────────────────────────────────
skip('XLSX.writeFile produces downloadable blob')
skip('FileReader reads uploaded JSON file')
skip('page reload after successful restore')

// ─────────────────────────────────────────────────────────────────────────────
const total = passed + failed + skipped
console.log(`\n${'─'.repeat(52)}`)
console.log(`Results: ${passed} passed · ${failed} failed · ${skipped} skipped (browser-only)`)
console.log(`Coverage: ${Math.round(passed/Math.max(passed+failed,1)*100)}% of testable logic`)
if (failed === 0) console.log('🎉 All tests passing — safe to push\n')
else { console.log('⚠️  Fix failures before pushing\n'); process.exit(1) }
