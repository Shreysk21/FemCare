-- ====================================================================
-- FemCare Add Partner Sharing & Notifications Migration
-- Migration: 20261023_add_sharing_and_notifications.sql
-- ====================================================================

-- 1. In-App Notifications Table
CREATE TABLE IF NOT EXISTS public.in_app_notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    reference_id TEXT,
    status TEXT NOT NULL DEFAULT 'unread',
    data TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user ON public.in_app_notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_status ON public.in_app_notifications(user_id, status);

-- 2. Add recipient_id to circle_members if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'circle_members' AND column_name = 'recipient_id'
    ) THEN
        ALTER TABLE public.circle_members ADD COLUMN recipient_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_circle_members_recipient ON public.circle_members(recipient_id);
