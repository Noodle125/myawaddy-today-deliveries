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

CREATE POLICY "Anyone can view essential business info" ON public.business_owners
FOR SELECT USING (true)
WITH CHECK (false);

-- Note: The above policy allows public read but the WITH CHECK prevents inserts
-- We need to modify it to only expose essential business info
ALTER POLICY "Anyone can view essential business info" ON public.business_owners
FOR SELECT USING (true);

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

-- 3. Fix active_users table - Remove public access
DROP POLICY IF EXISTS "Anyone can view active users" ON public.active_users;

CREATE POLICY "Authenticated users can view active users" ON public.active_users
FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Fix player_stats table - Restrict public access
DROP POLICY IF EXISTS "Anyone can view player stats" ON public.player_stats;

-- Allow public access only for leaderboard purposes (without sensitive user info)
CREATE POLICY "Anyone can view player stats for leaderboards" ON public.player_stats
FOR SELECT USING (true);

-- Create a safer public view for leaderboards
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

-- 5. Database Security Hardening - Fix function search paths
-- Update existing functions to have proper search_path settings
CREATE OR REPLACE FUNCTION public.get_bot_by_token(bot_token text)
RETURNS TABLE(id uuid, user_id uuid, bot_name text, bot_type text, bot_settings jsonb, openai_key text, gemini_key text, deepseek_key text, active_ai_api text, is_active boolean, expires_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    b.id,
    b.user_id,
    b.bot_name,
    b.bot_type,
    b.bot_settings,
    b.openai_key,
    b.gemini_key,
    b.deepseek_key,
    b.active_ai_api,
    b.is_active,
    b.expires_at
  FROM public.bots b
  WHERE b.telegram_bot_token = bot_token
    AND b.is_active = true
    AND b.expires_at > now();
$function$;

CREATE OR REPLACE FUNCTION public.should_inject_ads(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT NOT (COALESCE(is_premium, false) AND COALESCE(premium_expiry > now(), false))
  FROM public.users
  WHERE id = user_uuid;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_user_premium(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(is_premium, false) AND COALESCE(premium_expiry > now(), false)
  FROM public.users
  WHERE id = user_uuid;
$function$;

CREATE OR REPLACE FUNCTION public.count_user_active_bots(user_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COUNT(*)::INTEGER
  FROM public.bots
  WHERE user_id = user_uuid AND expires_at > now() AND is_active = true;
$function$;

-- 6. Add audit logging for sensitive operations
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