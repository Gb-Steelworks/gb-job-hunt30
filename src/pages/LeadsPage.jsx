// LeadsPage.jsx — cleaned seed data + real HTTP link checker
// Removed leads with fabricated postings or generic search URLs

import { useState, useEffect } from 'react'
import { ExternalLink, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import RoleActionPanel from '../components/RoleActionPanel.jsx'
import { loadLeadStatuses, saveLeadStatus } from '../store/appStore.js'

const SEED_LEADS = [
  // -- AGENT 1: Recruiters + Job Boards --------------------------------------
  {
    id: 1, role_title: 'IT QA Specialist IV', company: 'Enbridge / Raise',
    via: 'Raise Recruiting', category: 'QA', type: 'Contract', work_model: 'Hybrid',
    pay_rate: '$54-57/hr W2', date_found: "2026-05-08", match_score: 95,
    contact_name: 'Raise Recruiting', contact_email: 'hello@raiserecruiting.com',
    status: 'New', notes: '',
    apply_link: 'https://raiserecruiting.com/job-postings/?s=enbridge+QA'
  },
  {
    id: 3, role_title: 'Sr. BA - Customer Comms', company: 'TEKsystems (FSI)',
    via: 'TEKsystems', category: 'BA', type: 'Contract', work_model: 'Remote',
    pay_rate: 'TBD', date_found: "2026-05-27", match_score: 91,
    contact_name: null, contact_email: null,  // hallucinated — scrubbed
    status: 'New', notes: '',
    apply_link: 'https://careers.teksystems.com/us/en'
  },
  {
    id: 5, role_title: 'Appian QA Tester', company: 'KBR',
    via: 'Direct', category: 'QA', type: 'Full-Time', work_model: 'On-site',
    pay_rate: 'TBD', date_found: "2026-04-12", match_score: 88,
    contact_name: 'KBR Talent Acquisition', contact_email: '',
    status: 'New', notes: '',
    apply_link: 'https://kbr.wd5.myworkdayjobs.com/en-US/kbr_careers/job/Houston-Texas/Appian-Software-QA-Tester_R2119912'
  },
  {
    id: 6, role_title: 'Sr. Agile Scrum Master', company: 'CrowdPlat',
    via: 'LinkedIn', category: 'PM', type: 'Contract', work_model: 'Remote',
    pay_rate: 'TBD', date_found: "2026-05-20", match_score: 85,
    contact_name: 'CrowdPlat Recruiting', contact_email: '',
    status: 'New', notes: '',
    apply_link: 'https://www.linkedin.com/jobs/view/4402322679'
  },
  {
    id: 7, role_title: 'QA Analyst / BA', company: 'Grenza Inc.',
    via: 'Indeed', category: 'QA', type: 'Contract', work_model: 'On-site',
    pay_rate: 'TBD', date_found: "2026-05-04", match_score: 80,
    contact_name: 'Grenza HR', contact_email: '',
    status: 'New', notes: '',
    apply_link: 'http://www.grenza.com/index.php/ct-careers'
  },
  // id:8 ESP Enterprises REMOVED — posting could not be verified
  {
    id: 9, role_title: 'Agile & Data Management Business Analyst', company: 'Kforce (Consumer Electronics Client)',
    via: 'Kforce', category: 'BA', type: 'Contract', work_model: 'Hybrid',
    pay_rate: '$65-70/hr', date_found: "2026-05-29", match_score: 94,
    contact_name: 'Cole Withers', contact_email: '',
    status: 'New', notes: 'Epics, user stories, SOPs, data architecture. Strong George match.',
    apply_link: 'https://www.kforce.com/find-work/search-jobs/?keyword=business+analyst+houston'
  },
  {
    id: 10, role_title: 'Business Analyst / Product Owner', company: 'Kforce',
    via: 'Kforce', category: 'BA', type: 'Contract', work_model: 'Hybrid',
    pay_rate: 'TBD', date_found: "2026-05-26", match_score: 92,
    contact_name: 'Cole Withers', contact_email: '',
    status: 'New', notes: 'Requirements mgmt, change mgmt, stakeholder coordination.',
    apply_link: 'https://www.kforce.com/find-work/search-jobs/?keyword=product+owner+houston'
  },
  {
    id: 39, role_title: 'IT Project Manager', company: 'Kforce (Client - Irving TX)',
    via: 'Kforce Dallas', category: 'PM', type: 'Contract', work_model: 'Hybrid',
    pay_rate: 'TBD', date_found: "2026-05-29", match_score: 93,
    contact_name: 'Kforce Dallas Recruiting', contact_email: '',
    status: 'New', notes: 'Irving TX (Dallas area). Central coordination between business stakeholders, product owners, delivery teams. Backlog mgmt, requirements gathering, stakeholder updates. Spotted by George on Kforce.com 5/4/26.',
    apply_link: 'https://www.kforce.com/find-work/search-jobs/?keyword=IT+project+manager&location=Dallas%2C+TX'
  },
  // id:11 Conviso Inc REMOVED — apply link was a generic LinkedIn search, not a real posting
  // id:12 Undisclosed QA Lead REMOVED — no real company or direct URL
  {
    id: 13, role_title: 'Salesforce QA Analyst', company: 'Insight Global (FSI Client)',
    via: 'Dice', category: 'QA', type: 'Contract', work_model: 'Remote',
    pay_rate: 'TBD', date_found: "2026-05-30", match_score: 84,
    contact_name: 'Insight Global Houston', contact_email: '',
    status: 'New', notes: '6 months+, Agile delivery team, Salesforce CRM + Experience Cloud.',
    apply_link: 'https://www.insightglobal.com/jobs/?search=salesforce+QA+analyst+remote'
  },
  {
    id: 15, role_title: 'MS Dynamics 365 ERP Project Manager', company: 'Crowe LLP',
    via: 'Direct - careers.crowe.com', category: 'PM', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: 'TBD', date_found: "2026-05-20", match_score: 87,
    contact_name: 'Crowe LLP Experienced Hiring', contact_email: '',
    status: 'New', notes: 'Houston TX. 5-8 yrs ERP PM, initiation through delivery. Crowe consulting culture similar to Deloitte/Capco background.',
    apply_link: 'https://careers.crowe.com/experienced-careers'
  },
  {
    id: 26, role_title: 'HCM/Payroll BA & Systems Implementation Lead', company: 'Crowe LLP',
    via: 'Direct - careers.crowe.com', category: 'BA', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: 'TBD', date_found: "2026-05-24", match_score: 85,
    contact_name: 'Crowe LLP Experienced Hiring', contact_email: '',
    status: 'New', notes: 'Houston TX. Public sector BA + implementation lead. Strong Makpar/IRS background is a differentiator here.',
    apply_link: 'https://careers.crowe.com/experienced-careers'
  },
  // -- AGENT 2: FSI + Boutique TX Consulting ---------------------------------
  {
    id: 16, role_title: 'Product Owner - Digital Banking', company: 'Frost Bank',
    via: 'Direct', category: 'PM', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$110-130K', date_found: "2026-05-16", match_score: 93,
    contact_name: 'Frost Bank HR', contact_email: '',
    status: 'New', notes: 'San Antonio TX. George has direct JPMC mobile banking experience.',
    apply_link: 'https://www.frostbank.com/about/careers'
  },
  {
    id: 17, role_title: 'Sr. Agile Delivery Manager', company: 'Slalom Consulting',
    via: 'Direct', category: 'PM', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$130-150K', date_found: "2026-05-25", match_score: 92,
    contact_name: 'Slalom Houston Recruiting', contact_email: '',
    status: 'New', notes: 'Houston TX. Strong Capco/Deloitte background is ideal for Slalom.',
    apply_link: 'https://www.slalom.com/us/en/careers'
  },
  {
    id: 18, role_title: 'Product Owner / BA - Mortgage & Insurance', company: 'West Monroe Partners',
    via: 'ZipRecruiter', category: 'PM', type: 'Contract', work_model: 'On-site',
    pay_rate: 'TBD', date_found: "2026-05-31", match_score: 91,
    contact_name: 'West Monroe Houston', contact_email: '',
    status: 'New', notes: '8+ yrs PO/BA, JIRA/Confluence, Agile/Scrum, TRID/RESPA knowledge helpful.',
    apply_link: 'https://www.westmonroe.com/careers'
  },
  {
    id: 19, role_title: 'Agile Delivery Manager / Sr. BA', company: 'Capco Consulting',
    via: 'Direct', category: 'BA', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$120-140K', date_found: "2026-05-20", match_score: 97,
    contact_name: 'Capco Houston Recruiting', contact_email: '',
    status: 'New', notes: 'George literally did this role at Capco 2021-2024. Strong return candidate.',
    apply_link: 'https://www.capco.com/careers'
  },
  {
    id: 20, role_title: 'Sr. Project Manager - Finance Transformation', company: 'Opportune LLP',
    via: 'Direct', category: 'PM', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$120-145K', date_found: "2026-05-13", match_score: 89,
    contact_name: 'Opportune LLP HR', contact_email: '',
    status: 'New', notes: 'Houston TX energy/FSI consulting boutique. ERP, PMO, transformation.',
    apply_link: 'https://www.opportune.com/careers'
  },
  {
    id: 21, role_title: 'Business Technology Product Manager - AI', company: 'Built In Houston (Multiple)',
    via: 'Built In', category: 'PM', type: 'Full-Time', work_model: 'Remote',
    pay_rate: '$120-150K', date_found: "2026-05-27", match_score: 87,
    contact_name: 'Built In Houston', contact_email: '',
    status: 'New', notes: 'AI product initiatives, sales platform roadmaps, backlog mgmt.',
    apply_link: 'https://builtin.com/jobs/houston/product'
  },
  {
    id: 22, role_title: 'Sr. Consultant (PM/BA)', company: 'Pariveda Solutions',
    via: 'Direct', category: 'BA', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$110-130K', date_found: "2026-05-04", match_score: 88,
    contact_name: 'Pariveda Dallas/Houston', contact_email: '',
    status: 'New', notes: 'Dallas HQ, Houston presence. Boutique tech consulting, values-driven culture.',
    apply_link: 'https://www.parivedasolutions.com/careers'
  },
  // -- VERIFIED LEADS --------------------------------------------------------
  {
    id: 23, role_title: 'Sr. Business Analyst - Cloud Migration (VA)', company: 'SAIC',
    via: 'Direct - jobs.saic.com', category: 'BA', type: 'Full-Time', work_model: 'Remote',
    pay_rate: 'TBD', date_found: "2026-05-30", match_score: 88,
    contact_name: 'SAIC Talent Acquisition', contact_email: '',
    status: 'New', notes: '100% remote TX. VA cloud migration. No clearance required.',
    apply_link: 'https://jobs.saic.com/jobs/17678430-sr-business-analyst'
  },
  {
    id: 24, role_title: 'Business Systems Analyst I/II', company: "Texas Children's Hospital",
    via: "Direct - texaschildrens.org/careers", category: 'BA', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$79-105K', date_found: "2026-05-27", match_score: 88,
    contact_name: "Texas Children's Hospital IT Recruiting", contact_email: '',
    status: 'New', notes: 'Houston TX. Innovative business solutions, process/data flow analysis, cross-functional delivery.',
    apply_link: 'https://jobs.texaschildrens.org/search/searchjobs?keyword=business+analyst'
  },
  {
    id: 25, role_title: 'Systems Analyst - D365 F&O', company: 'Perry Homes',
    via: 'Direct - careers.perryhomes.com', category: 'BA', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$90-125K', date_found: "2026-05-24", match_score: 85,
    contact_name: 'Perry Homes IT Recruiting', contact_email: '',
    status: 'New', notes: 'Houston TX. D365 Finance & Operations, PMO collaboration, requirements gathering.',
    apply_link: 'https://jobs.perryhomes.com'
  },
  // -- CONSULTING ------------------------------------------------------------
  {
    id: 27, role_title: 'Management Consulting - Retail Banking Sr Manager', company: 'Accenture',
    via: 'Direct - accenture.com/careers', category: 'consulting', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$150-210K', date_found: "2026-05-04", match_score: 91,
    contact_name: 'Accenture Experienced Recruiting', contact_email: '',
    status: 'New', notes: 'Houston listed. Retail banking transformation. Capco FSI + JPMC background is direct match.',
    apply_link: 'https://www.accenture.com/us-en/careers/jobdetails?id=R00246570_en'
  },
  {
    id: 28, role_title: 'Sr Consultant/Manager (Agile/SAFe, Process Analysis)', company: 'Deloitte',
    via: 'Direct - jobs2.deloitte.com', category: 'consulting', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$115-170K', date_found: "2026-05-27", match_score: 93,
    contact_name: 'Deloitte Recruiting - Houston', contact_email: '',
    status: 'New', notes: 'Houston. SAFe Scrum Master cert + process analysis. Prior Deloitte tenure is a strong returnee advantage.',
    apply_link: 'https://jobs2.deloitte.com/us/en/search-results?keywords=agile&location=Houston%2C+Texas'
  },
  // -- GOVERNMENT ------------------------------------------------------------
  {
    id: 29, role_title: 'Sr. Business Analyst - Universal Services', company: 'Harris County',
    via: 'Direct - governmentjobs.com/careers/harriscountytx', category: 'govt', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: 'Depends on Qualifications', date_found: "2026-05-15", match_score: 94,
    contact_name: 'Harris County HR', contact_email: 'ADACoordinator@bmd.hctx.net',
    status: 'New', notes: 'CLOSES 5/23/2026 — APPLY ASAP. Agile + hybrid, SDLC, cross-functional. Makpar/IRS govt background is a direct match.',
    apply_link: 'https://www.governmentjobs.com/careers/harriscountytx/jobs/5309137-0/sr-business-analyst'
  },
  {
    id: 30, role_title: 'IT Project Manager (Level I & II)', company: 'Harris County Universal Services',
    via: 'Direct - governmentjobs.com/careers/harriscountytx', category: 'govt', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: 'Depends on Qualifications', date_found: "2026-04-29", match_score: 91,
    contact_name: 'Harris County HR', contact_email: '',
    status: 'New', notes: 'Hiring 2 PMs. Level II: medium-large tech projects, cross-functional teams. JIRA required.',
    apply_link: 'https://www.governmentjobs.com/careers/harriscountytx/jobs/5049206-0/it-project-manager'
  },
  {
    id: 31, role_title: 'Business Analyst (Multiple Levels)', company: 'Harris County Universal Services',
    via: 'Direct - governmentjobs.com/careers/harriscountytx', category: 'govt', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: 'Depends on Qualifications', date_found: "2026-05-04", match_score: 89,
    contact_name: 'Harris County HR', contact_email: '',
    status: 'New', notes: 'Broad posting for multiple BA levels. Agile CSPO/CBAP cert a plus.',
    apply_link: 'https://www.governmentjobs.com/careers/harriscountytx/jobs/5066840/business-analyst'
  },
  {
    id: 32, role_title: 'IT Lead - Business Analysis (IT Architect)', company: 'City of Houston - HITS',
    via: 'Direct - governmentjobs.com/careers/houston', category: 'govt', type: 'Full-Time', work_model: 'On-site',
    pay_rate: 'Pay Grade 29', date_found: "2026-04-19", match_score: 88,
    contact_name: 'City of Houston HR', contact_email: '',
    status: 'New', notes: '611 Walker, Houston TX. IT Liaison/BA Lead bridging business + IT. PMO division.',
    apply_link: 'https://www.governmentjobs.com/careers/houston'
  },
  // -- KPMG ------------------------------------------------------------------
  {
    id: 33, role_title: 'Sr Associate, CFO/F&A Technology Business Analyst', company: 'KPMG',
    via: 'Direct - kpmguscareers.com', category: 'BA', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: 'TBD', date_found: "2026-05-20", match_score: 93,
    contact_name: 'KPMG Recruiting', contact_email: '',
    status: 'New', notes: 'Houston TX. Agile, PM skills, accounting/financial reporting BA. CFO advisory practice.',
    apply_link: 'https://www.kpmguscareers.com/jobdetail/?jobId=125697'
  },
  {
    id: 34, role_title: 'Sr Specialist, ServiceNow HRSD Business Analyst', company: 'KPMG',
    via: 'Direct - kpmguscareers.com', category: 'BA', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: 'TBD', date_found: "2026-05-13", match_score: 88,
    contact_name: 'KPMG Recruiting', contact_email: '',
    status: 'New', notes: 'Houston listed. ServiceNow HRSD config, Agile, business analysis tools.',
    apply_link: 'https://www.kpmguscareers.com/jobdetail/?jobId=128082'
  },
  {
    id: 35, role_title: 'Sr Associate, Business Analyst', company: 'KPMG',
    via: 'Direct - kpmguscareers.com', category: 'BA', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: 'TBD', date_found: "2026-05-24", match_score: 91,
    contact_name: 'KPMG Recruiting', contact_email: '',
    status: 'New', notes: 'Houston TX. Core BA advisory role. KPMG Advisory is their fastest growing practice.',
    apply_link: 'https://www.kpmguscareers.com/jobdetail/?jobId=132411'
  },
  {
    id: 36, role_title: 'Technology Project Manager - GMS Tax', company: 'KPMG',
    via: 'Direct - kpmguscareers.com', category: 'PM', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: 'TBD', date_found: "2026-05-16", match_score: 87,
    contact_name: 'KPMG Recruiting', contact_email: '',
    status: 'New', notes: 'Houston TX. Agile/Scrum PM for analytics practice.',
    apply_link: 'https://www.kpmguscareers.com/job-search/'
  },
  {
    id: 37, role_title: 'KPMG Assignment Select (KAS) - Contract PM/BA', company: 'KPMG',
    via: 'KPMG contractor portal', category: 'consulting', type: 'Contract', work_model: 'Remote',
    pay_rate: 'Project rate', date_found: "2026-05-27", match_score: 90,
    contact_name: 'KPMG KAS Recruiting', contact_email: '',
    status: 'New', notes: 'Register at kpmguscareers.com/contractor — project-based work across Advisory, Risk, PM, BA.',
    apply_link: 'https://www.kpmguscareers.com/contractor/'
  },
  // -- EY GigNow -------------------------------------------------------------
  {
    id: 38, role_title: 'EY GigNow - Contract BA/PM/Delivery', company: 'EY Ernst & Young',
    via: 'EY GigNow contractor portal', category: 'consulting', type: 'Contract', work_model: 'Remote',
    pay_rate: 'Project rate', date_found: "2026-06-02", match_score: 92,
    contact_name: 'EY GigNow Recruiting', contact_email: '',
    status: 'New', notes: 'Register at app.gignow.com/ey — EY alumni explicitly welcomed. BA, PM, Delivery, Risk all in scope.',
    apply_link: 'https://app.gignow.com/ey/job_postings'
  },
  // -- May 7 2026 agent run --------------------------------------------------
  {
    id: 40, role_title: 'Project / Program Manager', company: 'Artemis Connection',
    via: 'Artemis Connection', category: 'consulting', type: 'Contract', work_model: 'Remote',
    pay_rate: '$70-80/hr', date_found: "2026-05-28", match_score: 90,
    contact_name: 'Christy Johnson (Founder)', contact_email: '',
    status: 'New', notes: '12-month engagement, public sector VA client, occasional travel DC/Denver. PMP preferred. McKinsey-pedigree boutique firm. ATS resume prepared.',
    apply_link: 'https://artemis-connection.breezy.hr/'
  },
  {
    id: 41, role_title: 'Project Manager / Scrum Master', company: 'V3Main Technologies',
    via: 'V3Main', category: 'PM', type: 'Contract', work_model: 'On-site',
    pay_rate: 'TBD', date_found: "2026-05-27", match_score: 93,
    contact_name: 'V3Main HR', contact_email: 'careers@v3main.com',
    status: 'New', notes: '6-12 month contract, multiple positions. Houston-based. CSM/PMP a plus.',
    apply_link: 'https://www.v3main.com/project-managerscrum-master.html'
  },
  {
    id: 42, role_title: 'Sr. Business Analyst — Capital Markets Risk Tech', company: 'Insight Global (FSI client)',
    via: 'Insight Global', category: 'BA', type: 'Contract', work_model: 'Remote',
    pay_rate: 'TBD', date_found: "2026-05-24", match_score: 91,
    contact_name: 'Insight Global Houston', contact_email: '',
    status: 'New', notes: 'Capital Markets BA — agile sprints, regulatory priorities. Strong FSI + Capco/JPMC alignment.',
    apply_link: 'https://jobs.insightglobal.com/find_a_job/?remote=false&miles=False&srch=Business+Analyst'
  },
  {
    id: 43, role_title: 'Scrum Master / Agile PM — Cybersecurity PMO', company: 'CEDENT (Houston bank client)',
    via: 'CEDENT', category: 'PM', type: 'Contract', work_model: 'Hybrid',
    pay_rate: 'TBD', date_found: "2026-05-29", match_score: 88,
    contact_name: 'CEDENT Recruiting', contact_email: '',
    status: 'New', notes: 'Scrum Master for Tier-0 security team. Backlog mgmt, sprint ceremonies. CSM required — George has it.',
    apply_link: 'https://theapplicantmanager.com/careers?co=dt'
  },
  {
    id: 44, role_title: 'IT Business Analyst — Lead Management / AI', company: 'Insight Global (Austin client)',
    via: 'Insight Global', category: 'BA', type: 'Contract', work_model: 'Hybrid',
    pay_rate: 'TBD', date_found: "2026-05-16", match_score: 82,
    contact_name: 'Insight Global Austin', contact_email: '',
    status: 'New', notes: '5+ yrs BA + PM, Agile SDLC, Salesforce/Eloqua. Gen AI experience required — George has it.',
    apply_link: 'https://jobs.insightglobal.com/find_a_job/?remote=false&miles=False&srch=Business+Analyst'
  },
  {
    id: 47, role_title: 'Agile Project Manager', company: 'Artemis Connection (2nd role)',
    via: 'Artemis Connection', category: 'PM', type: 'Contract', work_model: 'Remote',
    pay_rate: '$70-80/hr', date_found: "2026-05-28", match_score: 90,
    contact_name: 'Christy Johnson (Founder)', contact_email: '',
    status: 'New', notes: 'Same firm as id:40 — second open PM engagement. Remote-first. High pay band.',
    apply_link: 'https://artemis-connection.breezy.hr/'
  },
  {
    id: 49, role_title: 'UAT Test Manager — Lending Platform', company: 'NTT DATA',
    via: 'NTT DATA', category: 'QA', type: 'Contract', work_model: 'Remote',
    pay_rate: 'TBD', date_found: "2026-05-20", match_score: 87,
    contact_name: 'NTT DATA Recruiting', contact_email: '',
    status: 'New', notes: 'UAT Test Manager for lending/fintech product. George: 20+ yrs QA, managed UAT at JPMC & Deloitte.',
    apply_link: 'https://careers-inc.nttdata.com/go/Project-Manager-Jobs-in-Plano/3364100/'
  },

  // -- NEW LEADS from Claude live search Jun 3, 2026 -----------------------
  {
    id: 101, role_title: 'Sr. Technical Business Analyst (Digital Products)', company: 'Undisclosed Enterprise',
    via: 'The Judge Group', category: 'BA', type: 'Contract', work_model: 'Hybrid',
    pay_rate: '$30-40/hr (negotiate up)', date_found: '2026-06-03', match_score: 93,
    contact_name: 'T. Verma', contact_email: 'tverma@judge.com',
    status: 'New', notes: '12-month contract. BA + Scrum Master hybrid. Azure DevOps backlog, Agile ceremonies, UAT. AEM preferred. W2 only, local Houston.',
    apply_link: 'https://www.judge.com/job-seekers/search-jobs/'
  },
  {
    id: 102, role_title: 'Business Analyst II', company: 'Undisclosed Client (Downtown Houston)',
    via: 'Kforce', category: 'BA', type: 'Contract', work_model: 'Hybrid',
    pay_rate: '$40-47/hr', date_found: '2026-06-03', match_score: 91,
    contact_name: 'Cole Withers', contact_email: '',
    status: 'New', notes: 'Posted today. Mon-Thu onsite, Fri remote. Vendor mgmt, project goals, metrics, budget. Contact Cole directly.',
    apply_link: 'https://www.kforce.com/find-work/search-jobs/?keyword=business+analyst+houston'
  },
  {
    id: 103, role_title: 'Scrum Master / PM — Data Center to Cloud Migration', company: 'Undisclosed Fortune 100',
    via: 'Staffing (Remote)', category: 'PM', type: 'Contract', work_model: 'Remote',
    pay_rate: '~$55-65/hr', date_found: '2026-06-03', match_score: 90,
    contact_name: '', contact_email: '',
    status: 'New', notes: 'Long-term remote contract. Leads cross-functional teams through cloud migration (Rehost/Re-platform/Rewrite). Strong JPMC cloud delivery match.',
    apply_link: 'https://www.dice.com/jobs/q-scrum+master+cloud+migration-l-remote-jobs'
  },
  {
    id: 104, role_title: 'Scrum Master', company: 'Undisclosed Client (Downtown Houston)',
    via: 'Direct', category: 'PM', type: 'Contract-to-Hire', work_model: 'On-site',
    pay_rate: '$47-63/hr', date_found: '2026-06-03', match_score: 88,
    contact_name: '', contact_email: '',
    status: 'New', notes: 'Contract-to-hire. 4 days/week onsite downtown Houston. USC/GC only. CSM required — George qualifies. Sprint ceremonies, OKRs, backlog.',
    apply_link: 'https://jobtoday.com/us/jobs-scrum-master/tx_houston'
  },
  {
    id: 105, role_title: 'Senior Associate, Technical Delivery Project Manager', company: 'PwC',
    via: 'Direct', category: 'Consulting', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$85-132K', date_found: '2026-06-03', match_score: 94,
    contact_name: 'PwC Experienced Hiring', contact_email: '',
    status: 'New', notes: 'Houston + multi-location. Software and product innovation delivery. Deloitte/Capco background is direct match for PwC Senior Associate tier.',
    apply_link: 'https://jobs.us.pwc.com/job/denver/senior-associate-technical-delivery-project-manager/932/94266588832'
  },
  {
    id: 106, role_title: 'Application Management Specialist — Facilities Mgmt & Public Safety', company: 'Deloitte',
    via: 'Direct', category: 'Consulting', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$110-140K', date_found: '2026-06-03', match_score: 95,
    contact_name: 'Deloitte Experienced Hiring', contact_email: '',
    status: 'New', notes: 'Posted May 29. Houston + 30 locations. Govt/public sector delivery. Deloitte returnee advantage. Makpar/IRS federal background is key differentiator.',
    apply_link: 'https://jobsus.deloitte.com/locations/houston-tx/jobs/'
  },
  {
    id: 107, role_title: 'Managed Services — Oracle Functional Test Lead, Sr Associate', company: 'PwC',
    via: 'Direct', category: 'QA', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$84-202K', date_found: '2026-06-03', match_score: 89,
    contact_name: 'PwC Experienced Hiring', contact_email: '',
    status: 'New', notes: 'Houston + 45 locations. QA leadership inside PwC Managed Services. Alliance Global/Deloitte Testing CoE background maps directly.',
    apply_link: 'https://jobs.us.pwc.com'
  },
  {
    id: 108, role_title: 'Consulting, Project Delivery Specialist', company: 'Deloitte',
    via: 'Direct', category: 'Consulting', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$110-130K', date_found: '2026-06-03', match_score: 92,
    contact_name: 'Deloitte Experienced Hiring', contact_email: '',
    status: 'New', notes: 'Austin TX + travel. Testing and implementation services across FSI, healthcare, state/local govt. Exact overlap with Deloitte CoE and IRS work.',
    apply_link: 'https://jobsus.deloitte.com'
  },
  {
    id: 109, role_title: 'Technology Risk Investigations — Senior Associate', company: 'JP Morgan Chase',
    via: 'Direct', category: 'BA', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$110-130K', date_found: '2026-06-03', match_score: 91,
    contact_name: 'JPMC Talent Acquisition', contact_email: '',
    status: 'New', notes: 'Posted Feb 4. Houston + 2 locations. Risk and technology oversight. JPMC returnee advantage — George served as Agility Lead/PM 2018-19.',
    apply_link: 'https://jpmc.fa.oraclecloud.com'
  },
  {
    id: 110, role_title: 'Sr. Associate, Regulatory Change Management', company: 'Coinbase',
    via: 'Direct', category: 'BA', type: 'Full-Time', work_model: 'Remote',
    pay_rate: 'Competitive', date_found: '2026-06-03', match_score: 86,
    contact_name: 'Coinbase Recruiting', contact_email: '',
    status: 'New', notes: 'Houston / Remote. Regulatory change management — direct map to Capco MRA controls and $10M+ regulatory risk mitigation work.',
    apply_link: 'https://www.coinbase.com/careers'
  },
  {
    id: 111, role_title: 'Business Analyst / Product Analyst (Federal)', company: 'Deloitte',
    via: 'Direct', category: 'Consulting', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$110-130K', date_found: '2026-06-03', match_score: 93,
    contact_name: 'Deloitte Experienced Hiring', contact_email: '',
    status: 'New', notes: 'Recruiting ends 6/29/2026. Federal contract BA/advisor role. Houston + multi-location. Makpar/IRS eAuthentication federal work is exact credential targeted.',
    apply_link: 'https://jobsus.deloitte.com/locations/houston-tx/jobs/'
  },
  {
    id: 112, role_title: 'Business Application Consulting — Program Risk & Quality Director', company: 'PwC',
    via: 'Direct', category: 'Consulting', type: 'Full-Time', work_model: 'Hybrid',
    pay_rate: '$150-200K', date_found: '2026-06-03', match_score: 91,
    contact_name: 'PwC Experienced Hiring', contact_email: '',
    status: 'New', notes: 'Posted Jun 12. Houston + 14 locations. QA governance at Director level. Deloitte Testing CoE + Capco PMO delivery is exact pedigree targeted.',
    apply_link: 'https://jobs.us.pwc.com'
  },
  // id:45 Discover Financial REMOVED — apply link was a generic Indeed search
  // id:46 Invesco REMOVED — apply link was a generic Indeed search
  // id:48 Paperless Environments REMOVED — apply link was a generic Indeed search
  // id:50 NRG Energy REMOVED — apply link was a generic Indeed search
  // id:51 Dine Development REMOVED — apply link was a generic Indeed search
  // id:52 Benchmark Mortgage REMOVED — apply link was a generic Indeed search
]

const STATUS_OPTIONS = ['New', 'Reviewing', 'Applied', 'Passed', 'Closed']

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <ChevronsUpDown size={10} style={{ opacity: 0.3 }} />
  return sortDir === 'desc' ? <ChevronDown size={10} /> : <ChevronUp size={10} />
}

function scoreColor(s) {
  return s >= 90 ? 'var(--success)' : s >= 80 ? 'var(--warn)' : 'var(--text3)'
}

function calcAge(lead) {
  if (!lead.date_found) return 0
  const ms = Date.now() - new Date(lead.date_found).getTime()
  return Math.max(0, Math.floor(ms / 86400000))
}

export default function LeadsPage({ onApplicationLogged, agentLeads = [], initialCompanyFilter = '', onClearCompanyFilter, onNewRolePattern }) {
  const [leads, setLeads] = useState(() => {
    const saved = loadLeadStatuses()
    return SEED_LEADS.map(l => saved[l.id] ? { ...l, status: saved[l.id] } : l)
  })
  const [search, setSearch] = useState(initialCompanyFilter)
  const [fType, setFType] = useState('')
  const [fModel, setFModel] = useState('')
  const [fRole, setFRole] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [sortCol, setSortCol] = useState('match_score')
  const [sortDir, setSortDir] = useState('desc')
  const [activeRole, setActiveRole] = useState(null)
  const [checking, setChecking] = useState(false)
  const [checkResults, setCheckResults] = useState({})
  const [showAddLead, setShowAddLead] = useState(false)
  const [showDeadSection, setShowDeadSection] = useState(true)
  const [newLead, setNewLead] = useState({
    role_title: '', company: '', work_model: 'Hybrid', type: 'Full-Time',
    pay_rate: '', date_found: new Date().toISOString().slice(0,10), match_score: 85, category: 'BA',
    contact_name: '', contact_email: '', apply_link: '', notes: '',
    status: 'New', via: 'Manual entry'
  })

  const fl = (k, v) => setNewLead(prev => ({ ...prev, [k]: v }))

  const handleAddLead = () => {
    if (!newLead.role_title || !newLead.company) return
    const lead = { ...newLead, id: Date.now() }
    setLeads(prev => [lead, ...prev])
    onNewRolePattern?.({ role_title: newLead.role_title, company: newLead.company, location: newLead.work_model })
    setShowAddLead(false)
    setNewLead({
      role_title: '', company: '', work_model: 'Hybrid', type: 'Full-Time',
      pay_rate: '', date_found: new Date().toISOString().slice(0,10), match_score: 85, category: 'BA',
      contact_name: '', contact_email: '', apply_link: '', notes: '',
      status: 'New', via: 'Manual entry'
    })
  }

  // Real HTTP link checker — uses /api/check-link.js serverless endpoint
  const checkAllLinks = async () => {
    setChecking(true)
    setCheckResults({})
    for (const lead of leads) {
      if (!lead.apply_link) {
        setCheckResults(prev => ({ ...prev, [lead.id]: 'no-link' }))
        continue
      }
      setCheckResults(prev => ({ ...prev, [lead.id]: 'checking' }))
      try {
        const res = await fetch('/api/check-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: lead.apply_link }),
        })
        const data = await res.json()
        if (data.dead) {
          setCheckResults(prev => ({ ...prev, [lead.id]: 'dead' }))
        } else if (data.blocked) {
          setCheckResults(prev => ({ ...prev, [lead.id]: 'blocked' }))
        } else {
          setCheckResults(prev => ({ ...prev, [lead.id]: 'ok' }))
        }
      } catch {
        setCheckResults(prev => ({ ...prev, [lead.id]: 'blocked' }))
      }
      // Small delay to avoid hammering servers
      await new Promise(r => setTimeout(r, 400))
    }
    setChecking(false)
  }

  useEffect(() => {
    if (!agentLeads.length) return
    setLeads(prev => {
      const ids = new Set(prev.map(l => l.id))
      const saved = loadLeadStatuses()
      const newLeads = agentLeads
        .filter(l => !ids.has(l.id))
        .map(l => saved[l.id] ? { ...l, status: saved[l.id] } : l)
      return [...prev, ...newLeads]
    })
  }, [agentLeads])

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortCol(col); setSortDir('desc') }
  }

  const updateStatus = (id, val) => {
    saveLeadStatus(id, val)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: val } : l))
  }

  const handleApplied = (appData) => {
    setLeads(prev => prev.map(l => l.id === appData.id ? { ...l, status: 'Applied' } : l))
    onApplicationLogged?.(appData)
    setActiveRole(null)
  }

  const baseFilter = (l) => {
    const q = search.toLowerCase()
    if (q && !l.role_title.toLowerCase().includes(q) && !l.company.toLowerCase().includes(q)) return false
    if (fType && l.type !== fType) return false
    if (fModel) {
      if (fModel === 'Dallas' || fModel === 'Austin') {
        const loc = fModel.toLowerCase()
        if (!((l.notes || '').toLowerCase().includes(loc) || (l.company || '').toLowerCase().includes(loc) || (l.via || '').toLowerCase().includes(loc))) return false
      } else {
        if (l.work_model !== fModel) return false
      }
    }
    if (fRole && l.category !== fRole) return false
    if (fStatus && l.status !== fStatus) return false
    return true
  }

  const sortFn = (a, b) => {
    const av = a[sortCol] ?? ''
    const bv = b[sortCol] ?? ''
    const mul = sortDir === 'desc' ? -1 : 1
    return av < bv ? mul : av > bv ? -mul : 0
  }

  // After Check Links runs, quarantine dead links into a separate section below the table
  const hasCheckResults = Object.keys(checkResults).length > 0
  const filtered     = leads.filter(l => baseFilter(l) && checkResults[l.id] !== 'dead').sort(sortFn)
  const deadFiltered = hasCheckResults
    ? leads.filter(l => baseFilter(l) && checkResults[l.id] === 'dead').sort(sortFn)
    : []

  const newCount = leads.filter(l => l.status === 'New').length
  const remoteCount = leads.filter(l => l.work_model === 'Remote').length
  const appliedCount = leads.filter(l => l.status === 'Applied').length
  const avg = Math.round(leads.reduce((s, l) => s + l.match_score, 0) / leads.length)

  const linkStatusIcon = (id) => {
    const r = checkResults[id]
    if (!r || r === 'checking') return r === 'checking' ? <span style={{ fontSize: 9, color: 'var(--warn)' }}>⏳</span> : null
    if (r === 'dead') return <span style={{ fontSize: 9, color: 'var(--danger)', fontWeight: 700 }}>⚠️ DEAD</span>
    if (r === 'blocked') return <span style={{ fontSize: 9, color: 'var(--text3)' }} title="Site blocked checker — verify manually">🔒</span>
    if (r === 'ok') return <span style={{ fontSize: 9, color: 'var(--success)' }}>✓ live</span>
    return null
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Job Leads</div>
        <div className="page-sub">
          {leads.length} verified leads · Last cleaned May 8, 2026 · Use 🔗 Check Links for real HTTP status
        </div>
      </div>

      {initialCompanyFilter && (
        <div className="card" style={{ marginBottom: 12, background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px' }}>
          <span style={{ fontSize: 12, color: 'var(--accent)' }}>
            Filtered by company: <strong>{initialCompanyFilter}</strong>
          </span>
          <button className="btn btn-sm" onClick={() => { setSearch(''); onClearCompanyFilter?.() }}>Clear filter</button>
        </div>
      )}

      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="stat-card accent"><div className="s-label">Total</div><div className="s-val">{leads.length}</div></div>
        <div className="stat-card"><div className="s-label">New</div><div className="s-val">{newCount}</div></div>
        <div className="stat-card"><div className="s-label">Applied</div><div className="s-val">{appliedCount}</div></div>
        <div className="stat-card"><div className="s-label">Remote</div><div className="s-val">{remoteCount}</div></div>
        <div className="stat-card"><div className="s-label">Avg Match</div><div className="s-val">{avg}%</div></div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <input type="text" placeholder="Search role, company..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ width: 180 }} />
          <select value={fType} onChange={e => setFType(e.target.value)}>
            <option value="">All types</option>
            <option>Contract</option><option>Full-Time</option><option>Contract-to-Hire</option>
          </select>
          <select value={fModel} onChange={e => setFModel(e.target.value)}>
            <option value="">All locations</option>
            <option>Remote</option><option>Hybrid</option><option>On-site</option>
            <option value="Dallas">Dallas / Irving</option><option value="Austin">Austin</option>
          </select>
          <select value={fRole} onChange={e => setFRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="QA">QA / Testing</option>
            <option value="BA">Business Analyst</option>
            <option value="PM">PM / Agile</option>
            <option value="consulting">Consulting</option>
            <option value="govt">Government</option>
          </select>
          <select value={fStatus} onChange={e => setFStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn" onClick={() => { setSearch(''); setFType(''); setFModel(''); setFRole(''); setFStatus(''); onClearCompanyFilter?.() }}>
          Clear
        </button>
        <button
          className="btn"
          onClick={checkAllLinks}
          disabled={checking}
          style={{ borderColor: checking ? 'var(--warn)' : undefined, color: checking ? 'var(--warn)' : undefined }}
          title="Does real HTTP checks — ✓ live means 200 OK, ⚠️ DEAD means 404/410, 🔒 means site blocked checker"
        >
          {checking ? '⏳ Checking...' : '🔗 Check Links'}
        </button>
        <button className="btn btn-accent" onClick={() => setShowAddLead(true)}>+ Add Lead</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {[
                ['role_title', 'Role', 170],
                ['company', 'Company', 100],
                ['type', 'Type', 80],
                ['work_model', 'Location', 75],
                ['date_found', 'Age', 44],
                ['match_score', 'Match', 76],
                ['contact_name', 'Contact', 110],
                [null, 'Status', 88],
                [null, 'Act.', 78],
              ].map(([col, label, width]) => (
                <th
                  key={label}
                  style={{ width, ...(label === 'Act.' ? { position: 'sticky', right: 0, background: 'var(--bg2)', zIndex: 2 } : {}) }}
                  onClick={col ? () => handleSort(col) : undefined}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {label}
                    {col && <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="empty">No leads match your filters.</td></tr>
            )}
            {filtered.map(l => (
              <tr key={l.id}>
                <td style={{ fontWeight: 500, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {l.role_title}
                    {linkStatusIcon(l.id)}
                  </div>
                  {l.notes && (
                    <div style={{ fontSize: 10, color: 'var(--text3)', fontStyle: 'italic', marginTop: 2 }}>
                      {l.notes}
                    </div>
                  )}
                </td>
                <td style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{l.company}</td>
                <td>
                  <span className={`pill pill-${l.type === 'Contract' ? 'contract' : 'ft'}`} style={{ fontSize: 9, whiteSpace: 'nowrap' }}>
                    {l.type === 'Contract-to-Hire' ? 'CTH' : l.type}
                  </span>
                </td>
                <td>
                  <span className={`pill pill-${l.work_model.toLowerCase().replace('-', '').replace(' ', '-')}`} style={{ fontSize: 9, whiteSpace: 'nowrap' }}>
                    {l.work_model}
                  </span>
                </td>
                <td style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: calcAge(l) <= 7 ? 'var(--success)' : calcAge(l) > 90 ? 'var(--warn)' : 'var(--text2)'
                }}>
                  {calcAge(l)}d
                </td>
                <td>
                  <div className="score-bar">
                    <div className="bar-bg">
                      <div className="bar-fill" style={{ width: `${l.match_score}%`, background: scoreColor(l.match_score) }} />
                    </div>
                    <span className="score-num" style={{ color: scoreColor(l.match_score) }}>{l.match_score}</span>
                  </div>
                </td>
                <td style={{ fontSize: 11 }}>
                  <div style={{ fontWeight: 500, color: 'var(--text)' }}>
                    {l.contact_name || <span style={{ color: 'var(--text3)' }}>—</span>}
                  </div>
                  {l.contact_email && (
                    <div style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>{l.contact_email}</div>
                  )}
                </td>
                <td>
                  <select className="status-sel" value={l.status} onChange={e => updateStatus(l.id, e.target.value)}>
                    {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{ position: 'sticky', right: 0, background: 'var(--bg2)', zIndex: 1 }}>
                  <div style={{ display: 'flex', gap: 3 }}>
                    <button className="btn btn-sm btn-accent" onClick={() => setActiveRole(l)}>Prep</button>
                    <a href={l.apply_link} target="_blank" rel="noopener noreferrer">
                      <button className="btn btn-sm"><ExternalLink size={10} /></button>
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Dead Links Quarantine Section ─────────────────────────────────────── */}
      {deadFiltered.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => setShowDeadSection(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '10px 14px',
              background: 'rgba(248,113,113,0.06)',
              border: '1px solid rgba(248,113,113,0.25)',
              borderRadius: showDeadSection ? '8px 8px 0 0' : '8px',
              cursor: 'pointer', color: 'var(--danger)', fontWeight: 600, fontSize: 12,
              fontFamily: 'var(--font)',
            }}
          >
            <span style={{ fontSize: 14 }}>⚠️</span>
            <span>Dead / Filled Postings ({deadFiltered.length})</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text3)', fontWeight: 400 }}>
              Links returned 404 or 410 · Verify before removing · click to {showDeadSection ? 'collapse' : 'expand'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{showDeadSection ? '▲' : '▼'}</span>
          </button>

          {showDeadSection && (
            <div style={{
              border: '1px solid rgba(248,113,113,0.25)', borderTop: 'none',
              borderRadius: '0 0 8px 8px', overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', opacity: 0.7 }}>
                <thead>
                  <tr style={{ background: 'rgba(248,113,113,0.06)' }}>
                    {[['Role', 170], ['Company', 100], ['Type', 80], ['Location', 75], ['Age', 44], ['Match', 76], ['Contact', 110], ['Status', 88], ['Act.', 78]].map(([label, width]) => (
                      <th key={label} style={{
                        width, padding: '7px 10px', textAlign: 'left',
                        fontSize: 10, fontWeight: 600, color: 'var(--danger)',
                        fontFamily: 'var(--font-mono)', borderBottom: '1px solid rgba(248,113,113,0.2)',
                        ...(label === 'Act.' ? { position: 'sticky', right: 0, background: 'rgba(30,10,10,0.95)', zIndex: 2 } : {})
                      }}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deadFiltered.map(l => (
                    <tr key={l.id} style={{ borderBottom: '1px solid rgba(248,113,113,0.1)' }}>
                      <td style={{ padding: '7px 10px', fontWeight: 500, color: 'var(--text3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ textDecoration: 'line-through' }}>{l.role_title}</span>
                          <span style={{ fontSize: 9, color: 'var(--danger)', fontWeight: 700 }}>⚠️ DEAD</span>
                        </div>
                        {l.notes && (
                          <div style={{ fontSize: 10, color: 'var(--text3)', fontStyle: 'italic', marginTop: 2 }}>{l.notes}</div>
                        )}
                      </td>
                      <td style={{ padding: '7px 10px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{l.company}</td>
                      <td style={{ padding: '7px 10px' }}>
                        <span className={`pill pill-${l.type === 'Contract' ? 'contract' : 'ft'}`} style={{ fontSize: 9, opacity: 0.6 }}>
                          {l.type === 'Contract-to-Hire' ? 'CTH' : l.type}
                        </span>
                      </td>
                      <td style={{ padding: '7px 10px' }}>
                        <span style={{ fontSize: 9, color: 'var(--text3)' }}>{l.work_model}</span>
                      </td>
                      <td style={{ padding: '7px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>
                        {calcAge(l)}d
                      </td>
                      <td style={{ padding: '7px 10px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{l.match_score}</span>
                      </td>
                      <td style={{ padding: '7px 10px', fontSize: 11, color: 'var(--text3)' }}>
                        {l.contact_name || '—'}
                      </td>
                      <td style={{ padding: '7px 10px' }}>
                        <span style={{ fontSize: 10, color: 'var(--text3)' }}>{l.status}</span>
                      </td>
                      <td style={{ padding: '7px 10px', position: 'sticky', right: 0, background: 'rgba(20,5,5,0.95)', zIndex: 1 }}>
                        <div style={{ display: 'flex', gap: 3 }}>
                          <button
                            onClick={() => setLeads(prev => prev.filter(x => x.id !== l.id))}
                            style={{
                              padding: '3px 8px', fontSize: 10, fontWeight: 600,
                              background: 'rgba(248,113,113,0.12)',
                              border: '1px solid rgba(248,113,113,0.3)',
                              borderRadius: 'var(--radius)', color: 'var(--danger)',
                              cursor: 'pointer', fontFamily: 'var(--font)',
                            }}
                          >
                            Remove
                          </button>
                          <a href={l.apply_link} target="_blank" rel="noopener noreferrer">
                            <button className="btn btn-sm" title="Verify link manually">
                              <ExternalLink size={10} />
                            </button>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{
                padding: '8px 14px', background: 'rgba(248,113,113,0.04)',
                borderTop: '1px solid rgba(248,113,113,0.15)',
                fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)',
                display: 'flex', gap: 16, alignItems: 'center',
              }}>
                <span>⚠️ = 404 or 410 HTTP response</span>
                <span>· Verify manually before removing</span>
                <button
                  onClick={() => {
                    const deadIds = new Set(deadFiltered.map(l => l.id))
                    setLeads(prev => prev.filter(l => !deadIds.has(l.id)))
                  }}
                  style={{
                    marginLeft: 'auto', padding: '3px 10px', fontSize: 10,
                    background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                    borderRadius: 'var(--radius)', color: 'var(--danger)',
                    cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600,
                  }}
                >
                  Remove all {deadFiltered.length} dead leads
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setShowAddLead(false)}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, width: 'min(560px, 95vw)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>+ Add Lead Manually</div>
            <div style={{ fontSize: 11, color: 'var(--accent)', background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 16 }}>
              Only add leads you have personally verified exist on the company's ATS. No generic search URLs.
            </div>
            <div className="form-grid-2">
              <div className="field"><label>Role title *</label><input type="text" placeholder="e.g. IT Project Manager" value={newLead.role_title} onChange={e => fl('role_title', e.target.value)} /></div>
              <div className="field"><label>Company *</label><input type="text" placeholder="e.g. Kforce" value={newLead.company} onChange={e => fl('company', e.target.value)} /></div>
              <div className="field"><label>Type</label>
                <select value={newLead.type} onChange={e => fl('type', e.target.value)}>
                  <option>Contract</option><option>Full-Time</option><option>Contract-to-Hire</option>
                </select>
              </div>
              <div className="field"><label>Location / Work model</label>
                <select value={newLead.work_model} onChange={e => fl('work_model', e.target.value)}>
                  <option>Remote</option><option>Hybrid</option><option>On-site</option>
                </select>
              </div>
              <div className="field"><label>Category</label>
                <select value={newLead.category} onChange={e => fl('category', e.target.value)}>
                  <option value="QA">QA / Testing</option><option value="BA">Business Analyst</option>
                  <option value="PM">PM / Agile</option><option value="consulting">Consulting</option>
                  <option value="govt">Government</option>
                </select>
              </div>
              <div className="field"><label>Pay rate</label><input type="text" placeholder="e.g. $60-70/hr or $110K" value={newLead.pay_rate} onChange={e => fl('pay_rate', e.target.value)} /></div>
              <div className="field"><label>Match score (0-100)</label><input type="number" min="0" max="100" value={newLead.match_score} onChange={e => fl('match_score', parseInt(e.target.value) || 80)} /></div>
              <div className="field"><label>Date found</label><input type="date" value={newLead.date_found} onChange={e => fl('date_found', e.target.value)} /></div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0', paddingTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>Contact</div>
              <div className="form-grid-2">
                <div className="field"><label>Name</label><input type="text" placeholder="e.g. Cole Withers" value={newLead.contact_name} onChange={e => fl('contact_name', e.target.value)} /></div>
                <div className="field"><label>Email</label><input type="text" placeholder="e.g. cwithers@kforce.com" value={newLead.contact_email} onChange={e => fl('contact_email', e.target.value)} /></div>
              </div>
            </div>
            <div className="field"><label>Apply link (direct ATS URL required)</label><input type="text" placeholder="https://..." value={newLead.apply_link} onChange={e => fl('apply_link', e.target.value)} /></div>
            <div className="field" style={{ marginBottom: 16 }}><label>Notes</label><textarea rows={2} placeholder="Any notes about this role..." value={newLead.notes} onChange={e => fl('notes', e.target.value)} /></div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowAddLead(false)}>Cancel</button>
              <button className="btn btn-accent" onClick={handleAddLead} disabled={!newLead.role_title || !newLead.company}>
                Add Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {activeRole && (
        <RoleActionPanel
          role={activeRole}
          onClose={() => setActiveRole(null)}
          onApplied={handleApplied}
        />
      )}
    </div>
  )
}
