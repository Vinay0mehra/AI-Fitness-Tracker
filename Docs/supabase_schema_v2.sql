-- Run this in the Supabase "SQL Editor" to upgrade your tables for the Advanced Tracking Options!

ALTER TABLE public.profiles
ADD COLUMN gender TEXT DEFAULT 'unspecified',
ADD COLUMN activity_level TEXT DEFAULT 'moderate',
ADD COLUMN macro_preference TEXT DEFAULT 'balanced';
