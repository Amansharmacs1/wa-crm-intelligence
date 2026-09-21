-- ==============================================================================
-- Wa-CRM Intelligence: Supabase PostgreSQL Database Schema
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 0. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  company_name TEXT,
  phone TEXT,
  business_type TEXT DEFAULT 'Real Estate',
  role TEXT DEFAULT 'Owner & Admin',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  contact_name TEXT NOT NULL,
  phone TEXT,
  source TEXT DEFAULT 'whatsapp-web',
  budget NUMERIC,
  location TEXT,
  requirement TEXT,
  purchase_timeline TEXT,
  intent TEXT,
  sentiment TEXT,
  lead_score INTEGER DEFAULT 0,
  urgency_score INTEGER DEFAULT 0,
  revenue_risk_score INTEGER DEFAULT 0,
  category TEXT,
  follow_up_status TEXT DEFAULT 'New',
  summary TEXT,
  recommended_action TEXT,
  suggested_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Conversations Table (Message history for leads)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  sender TEXT NOT NULL,
  message_timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Lead Analysis Events (Audit log for processing)
CREATE TABLE IF NOT EXISTS public.lead_analysis_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  analysis_status TEXT DEFAULT 'completed',
  model_name TEXT DEFAULT 'rule-based-nlp',
  processing_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for fast query lookups
CREATE INDEX IF NOT EXISTS idx_leads_contact_name ON public.leads(contact_name);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON public.conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_analysis_events_lead_id ON public.lead_analysis_events(lead_id);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_analysis_events ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policies for leads
CREATE POLICY "Users can view their own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert/update their leads"
  ON public.leads FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policies for conversations
CREATE POLICY "Users can access conversations for their leads"
  ON public.conversations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.leads 
    WHERE public.leads.id = public.conversations.lead_id 
    AND (public.leads.user_id = auth.uid() OR public.leads.user_id IS NULL)
  ));

-- Service role bypasses RLS automatically when using SUPABASE_SECRET_KEY
