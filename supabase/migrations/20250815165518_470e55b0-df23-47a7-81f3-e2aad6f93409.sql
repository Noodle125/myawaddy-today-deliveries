-- Security Fix: Address Critical Data Exposure Issues
-- Phase 1: Fix Critical RLS Policy Vulnerabilities

-- 1. Fix profiles table - Remove public access, add proper user/admin policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 2. Fix business_owners table - Restrict public access to essential info only
DROP POLICY IF EXISTS "Anyone can view business profiles by username" ON public.business_owners;

-- Create a view for public business info (only essential data)
CREATE OR REPLACE VIEW public.business_info AS
SELECT 
  id,
  business_name,
  username,
  logo_url,
  theme_color,
  created_at
FROM public.business_owners;

-- Grant public access to the view instead of the table
GRANT SELECT ON public.business_info TO anon, authenticated;

-- Create new restricted policy for business_owners table
CREATE POLICY "Users can view their own business profile" ON public.business_owners
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all business profiles" ON public.business_owners
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 3. Fix active_users table - Remove public access
DROP POLICY IF EXISTS "Anyone can view active users" ON public.active_users;

CREATE POLICY "Authenticated users can view active users" ON public.active_users
FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Fix player_stats table - Restrict public access for sensitive user info
DROP POLICY IF EXISTS "Anyone can view player stats" ON public.player_stats;

-- Create a safer public view for leaderboards (without user_id exposure)
CREATE OR REPLACE VIEW public.leaderboard_stats AS
SELECT 
  id,
  points,
  games_played,
  games_won,
  games_lost,
  updated_at
FROM public.player_stats
ORDER BY points DESC;

-- Grant access to the leaderboard view
GRANT SELECT ON public.leaderboard_stats TO anon, authenticated;

-- Restrict player_stats table access
CREATE POLICY "Users can view their own player stats" ON public.player_stats
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all player stats" ON public.player_stats
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 5. Add audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON public.audit_logs
FOR INSERT WITH CHECK (true);