-- Security Fix: Address Critical Data Exposure Issues
-- Phase 1: Fix Critical RLS Policy Vulnerabilities

-- 1. Fix profiles table - Secure user profile data
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Only allow users to view their own profiles and admins to view all
CREATE POLICY IF NOT EXISTS "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 2. Fix business_owners table - Create secure public view
DROP POLICY IF EXISTS "Anyone can view business profiles by username" ON public.business_owners;

-- Create a secure view for public business info (only essential, non-sensitive data)
CREATE OR REPLACE VIEW public.business_info AS
SELECT 
  id,
  business_name,
  username,
  logo_url,
  theme_color,
  created_at
FROM public.business_owners;

-- Grant public access to the safe view
GRANT SELECT ON public.business_info TO anon, authenticated;

-- Add admin policy for full business data access
CREATE POLICY IF NOT EXISTS "Admins can view all business profiles" ON public.business_owners
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 3. Fix active_users table - Remove anonymous public access
DROP POLICY IF EXISTS "Anyone can view active users" ON public.active_users;

CREATE POLICY IF NOT EXISTS "Authenticated users can view active users" ON public.active_users
FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Fix player_stats table - Create secure leaderboard access
DROP POLICY IF EXISTS "Anyone can view player stats" ON public.player_stats;

-- Create secure leaderboard view without exposing user_id
CREATE OR REPLACE VIEW public.public_leaderboard AS
SELECT 
  points,
  games_played,
  games_won,
  games_lost,
  updated_at
FROM public.player_stats
WHERE points > 0
ORDER BY points DESC
LIMIT 100;

-- Grant public access to leaderboard view
GRANT SELECT ON public.public_leaderboard TO anon, authenticated;

-- Secure the player_stats table itself
CREATE POLICY IF NOT EXISTS "Users can view their own player stats" ON public.player_stats
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Admins can view all player stats" ON public.player_stats
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 5. Add audit logging table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Secure audit logs - only admins can view
CREATE POLICY IF NOT EXISTS "Admins can view audit logs" ON public.audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow system to insert audit logs (for triggers)
CREATE POLICY IF NOT EXISTS "System can insert audit logs" ON public.audit_logs
FOR INSERT WITH CHECK (true);