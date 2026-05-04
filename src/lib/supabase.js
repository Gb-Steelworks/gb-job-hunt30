import { createClient } from '@supabase/supabase-js'

// Replace these with your Supabase project values
// Get them from: https://app.supabase.com → your project → Settings → API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─────────────────────────────────────────────
// SUPABASE TABLE SCHEMAS
// Run these SQL statements in your Supabase SQL Editor
// (app.supabase.com → your project → SQL Editor → New Query)
// ─────────────────────────────────────────────
//
// TABLE: leads
// CREATE TABLE leads (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   created_at timestamptz DEFAULT now(),
//   role_title text NOT NULL,
//   company text NOT NULL,
//   via text,
//   location text,
//   work_model text CHECK (work_model IN ('Remote','Hybrid','On-site')),
//   type text CHECK (type IN ('Contract','Full-Time','Contract-to-Hire')),
//   contract_length text,
//   pay_rate text,
//   days_posted integer,
//   match_score integer,
//   match_reason text,
//   contact_name text,
//   contact_title text,
//   contact_email text,
//   contact_phone text,
//   apply_link text,
//   source_url text,
//   status text DEFAULT 'New' CHECK (status IN ('New','Reviewing','Applied','Passed','Closed')),
//   notes text,
//   agent_source text,
//   category text CHECK (category IN ('QA','BA','PM'))
// );
//
// TABLE: applications
// CREATE TABLE applications (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   created_at timestamptz DEFAULT now(),
//   lead_id uuid REFERENCES leads(id),
//   role_title text NOT NULL,
//   company text NOT NULL,
//   date_applied date,
//   application_method text,
//   recruiter_name text,
//   recruiter_email text,
//   resume_version text,
//   cover_letter boolean DEFAULT false,
//   status text DEFAULT 'Applied' CHECK (status IN ('Applied','Phone Screen','Interview','Offer','Rejected','Ghosted')),
//   last_contact_date date,
//   next_action text,
//   next_action_date date,
//   notes text,
//   salary_discussed text,
//   offer_amount text,
//   decision text
// );
//
// TABLE: companies
// CREATE TABLE companies (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   created_at timestamptz DEFAULT now(),
//   name text NOT NULL,
//   industry text,
//   location text,
//   priority text DEFAULT 'Medium' CHECK (priority IN ('High','Medium','Low')),
//   career_url text,
//   linkedin_url text,
//   contact_name text,
//   contact_info text,
//   notes text,
//   target_roles text[],
//   role_statuses jsonb DEFAULT '{}'
// );
//
// TABLE: agent_runs
// CREATE TABLE agent_runs (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   run_at timestamptz DEFAULT now(),
//   agent text,
//   leads_found integer DEFAULT 0,
//   new_leads integer DEFAULT 0,
//   status text DEFAULT 'Success',
//   error_message text
// );
//
// Enable Row Level Security (run after creating tables):
// ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
// ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
// ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
// ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
//
// Create open policies (single-user app, no auth needed):
// CREATE POLICY "Allow all" ON leads FOR ALL USING (true) WITH CHECK (true);
// CREATE POLICY "Allow all" ON applications FOR ALL USING (true) WITH CHECK (true);
// CREATE POLICY "Allow all" ON companies FOR ALL USING (true) WITH CHECK (true);
// CREATE POLICY "Allow all" ON agent_runs FOR ALL USING (true) WITH CHECK (true);
