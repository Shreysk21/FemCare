-- ====================================================================
-- FemCare Add Sleep, Medications, and Activity Tables Migration
-- Migration: 20261023_add_sleep_meds_activity.sql
-- ====================================================================

-- 1. SLEEP LOGS TABLE
CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours INTEGER NOT NULL DEFAULT 7,
  minutes INTEGER NOT NULL DEFAULT 0,
  quality TEXT NOT NULL DEFAULT 'Good',
  quality_emoji TEXT NOT NULL DEFAULT '😴',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON public.sleep_logs(user_id, date DESC);

-- 2. MEDICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.medications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT DEFAULT '1 tablet',
  schedule_time TEXT DEFAULT '08:00 AM',
  reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_medications_user ON public.medications(user_id);

-- 3. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  steps INTEGER NOT NULL DEFAULT 0,
  step_goal INTEGER NOT NULL DEFAULT 8000,
  active_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON public.activity_logs(user_id, date DESC);
