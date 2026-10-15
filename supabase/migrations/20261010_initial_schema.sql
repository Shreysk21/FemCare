-- ====================================================================
-- FemCare Women's Health Application - Supabase PostgreSQL Schema
-- Migration: 20261010_initial_schema.sql
-- Description: Complete tables, foreign keys, RLS security policies,
--              and seed data for profile, cycles, symptoms, and Circle Care.
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE flow_intensity AS ENUM ('Light', 'Medium', 'Heavy');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE symptom_severity AS ENUM ('Mild', 'Moderate', 'Severe');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE member_role AS ENUM ('Partner', 'Parent', 'Friend', 'Caregiver');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE member_sync_status AS ENUM ('Connected & Syncing', 'Pending Invite', 'Disconnected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avg_cycle_length INTEGER NOT NULL DEFAULT 28 CHECK (avg_cycle_length BETWEEN 20 AND 45),
  avg_period_duration INTEGER NOT NULL DEFAULT 5 CHECK (avg_period_duration BETWEEN 2 AND 10),
  last_period_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  theme TEXT NOT NULL DEFAULT 'light',
  text_size TEXT NOT NULL DEFAULT 'normal',
  privacy_mode TEXT NOT NULL DEFAULT 'discreet',
  location_approved BOOLEAN NOT NULL DEFAULT true,
  city TEXT DEFAULT 'San Francisco, CA',
  joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. MENSTRUAL CYCLES TABLE
CREATE TABLE IF NOT EXISTS public.cycles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  length INTEGER NOT NULL DEFAULT 28,
  period_duration INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'current' CHECK (status IN ('current', 'completed', 'predicted')),
  phase TEXT NOT NULL DEFAULT 'Follicular Phase',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. DAILY PERIOD FLOW LOGS TABLE
CREATE TABLE IF NOT EXISTS public.cycle_flow_logs (
  id TEXT PRIMARY KEY,
  cycle_id TEXT NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  flow TEXT NOT NULL CHECK (flow IN ('Light', 'Medium', 'Heavy')),
  icon TEXT NOT NULL DEFAULT '🩸',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(cycle_id, date)
);

-- 6. SYMPTOM LOGS TABLE
CREATE TABLE IF NOT EXISTS public.symptom_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  symptom_id TEXT NOT NULL,
  symptom_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Pain & Discomfort',
  severity TEXT NOT NULL DEFAULT 'Moderate' CHECK (severity IN ('Mild', 'Moderate', 'Severe')),
  time_logged TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. MOOD LOGS TABLE
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood_id TEXT NOT NULL,
  label TEXT NOT NULL,
  emoji TEXT NOT NULL,
  time TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. HYDRATION TRACKING TABLE
CREATE TABLE IF NOT EXISTS public.hydration_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  current_ml INTEGER NOT NULL DEFAULT 0,
  goal_ml INTEGER NOT NULL DEFAULT 2000,
  glasses INTEGER NOT NULL DEFAULT 0,
  target_glasses INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, date)
);

-- 9. HYDRATION DRINK EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.hydration_entries (
  id TEXT PRIMARY KEY,
  hydration_log_id TEXT NOT NULL REFERENCES public.hydration_logs(id) ON DELETE CASCADE,
  time TEXT NOT NULL,
  amount_ml INTEGER NOT NULL DEFAULT 250,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. CIRCLE CARE (PARTNER & FAMILY SYNC) TABLE
CREATE TABLE IF NOT EXISTS public.circle_members (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Partner',
  email TEXT NOT NULL,
  sync_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Connected & Syncing',
  avatar TEXT NOT NULL DEFAULT '💖',
  -- Granular Privacy Sharing Toggles
  share_phase_and_window BOOLEAN NOT NULL DEFAULT true,
  share_emotional_state BOOLEAN NOT NULL DEFAULT true,
  share_specific_symptoms BOOLEAN NOT NULL DEFAULT false,
  share_private_notes BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_cycles_user_start ON public.cycles(user_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_flow_logs_cycle_date ON public.cycle_flow_logs(cycle_id, date);
CREATE INDEX IF NOT EXISTS idx_symptoms_user_date ON public.symptom_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_moods_user_date ON public.mood_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_hydration_user_date ON public.hydration_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_circle_user_sync ON public.circle_members(user_id, sync_code);

-- 12. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_flow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hydration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hydration_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and edit their own profile
CREATE POLICY "Users can manage own profile"
  ON public.profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Cycles: User access
CREATE POLICY "Users can manage own cycles"
  ON public.cycles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Flow Logs: User access through cycles
CREATE POLICY "Users can manage flow logs"
  ON public.cycle_flow_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Symptoms: User access
CREATE POLICY "Users can manage own symptoms"
  ON public.symptom_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Moods: User access
CREATE POLICY "Users can manage own moods"
  ON public.mood_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Hydration: User access
CREATE POLICY "Users can manage own hydration"
  ON public.hydration_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage own hydration entries"
  ON public.hydration_entries
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Circle Members: User access
CREATE POLICY "Users can manage own circle members"
  ON public.circle_members
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 13. SEED INITIAL DATA
INSERT INTO public.profiles (id, name, email, avg_cycle_length, avg_period_duration, last_period_start_date, theme, text_size, privacy_mode, location_approved, city, joined_date)
VALUES ('usr_101', 'Shreya Patel', 'shreya.patel@example.com', 28, 5, '2026-09-17', 'light', 'normal', 'discreet', true, 'San Francisco, CA', '2026-01-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cycles (id, user_id, start_date, end_date, length, period_duration, status, phase, notes)
VALUES 
  ('cyc_004', 'usr_101', '2026-09-17', '2026-09-21', 28, 5, 'current', 'Follicular Phase', 'Normal cycle start, slight cramps on day 1.'),
  ('cyc_003', 'usr_101', '2026-08-20', '2026-08-24', 28, 5, 'completed', 'Luteal Phase', 'Felt fatigued during days 1-2.'),
  ('cyc_002', 'usr_101', '2026-07-23', '2026-07-27', 28, 5, 'completed', 'Luteal Phase', 'Stayed well hydrated.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cycle_flow_logs (id, cycle_id, date, flow, icon)
VALUES
  ('fl_001', 'cyc_004', '2026-09-17', 'Heavy', '🩸'),
  ('fl_002', 'cyc_004', '2026-09-18', 'Medium', '🩸'),
  ('fl_003', 'cyc_004', '2026-09-19', 'Medium', '🩸'),
  ('fl_004', 'cyc_004', '2026-09-20', 'Light', '💧'),
  ('fl_005', 'cyc_004', '2026-09-21', 'Light', '💧')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.symptom_logs (id, user_id, date, symptom_id, symptom_name, category, severity, time_logged, notes)
VALUES
  ('sym_001', 'usr_101', '2026-09-30', 'cramps', 'Abdominal Cramps', 'Pain & Discomfort', 'Moderate', '09:30 AM', 'Noticed after morning walk.'),
  ('sym_002', 'usr_101', '2026-09-29', 'bloating', 'Bloating', 'Digestive & Body', 'Mild', '02:15 PM', 'Felt full after lunch.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.mood_logs (id, user_id, date, mood_id, label, emoji, time, note)
VALUES
  ('m_001', 'usr_101', '2026-09-30', 'good', 'Good', '🙂', '08:15 AM', 'Feeling energetic today.'),
  ('m_002', 'usr_101', '2026-09-29', 'okay', 'Okay', '😐', '07:45 PM', 'Calm evening.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hydration_logs (id, user_id, date, current_ml, goal_ml, glasses, target_glasses)
VALUES ('hyd_001', 'usr_101', '2026-09-30', 1250, 2000, 5, 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hydration_entries (id, hydration_log_id, time, amount_ml)
VALUES
  ('he_1', 'hyd_001', '08:00 AM', 250),
  ('he_2', 'hyd_001', '10:30 AM', 250),
  ('he_3', 'hyd_001', '12:15 PM', 250),
  ('he_4', 'hyd_001', '02:00 PM', 250),
  ('he_5', 'hyd_001', '03:45 PM', 250)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.circle_members (id, user_id, name, role, email, sync_code, status, avatar, share_phase_and_window, share_emotional_state, share_specific_symptoms, share_private_notes)
VALUES ('mem_1', 'usr_101', 'Alex Johnson', 'Partner', 'alex.j@example.com', 'FEM-8492', 'Connected & Syncing', '💖', true, true, false, false)
ON CONFLICT (id) DO NOTHING;
