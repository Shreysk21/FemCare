-- ====================================================================
-- FemCare Authentication Migration
-- Run this in your Supabase Dashboard -> SQL Editor
-- ====================================================================

-- 1. Ensure password_hash column exists in profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. Create index on lower(email) for fast authentication queries
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (lower(email));

-- 3. Set a default demo password hash for the initial user (usr_101)
-- Default demo password: password123
UPDATE public.profiles
SET password_hash = '$pbkdf2-sha256$29000$.T9nTGmNsfYeo9Ra691byw$8JIJpUFMqdG0FLnyOBteA/UMaWr8rKBXAtebLOouCg0'
WHERE email = 'shreya.patel@example.com' AND (password_hash IS NULL OR password_hash = '');

-- 4. Verify profiles columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
