-- Security Fix: Address Critical Data Exposure Issues
-- Fix critical RLS vulnerabilities by securing exposed user data

-- 1. Secure profiles table - Remove public access to user profile data
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- 2. Secure business_owners table - Remove broad public access
DROP POLICY IF EXISTS "Anyone can view business profiles by username" ON public.business_owners;

-- Create a secure public view for essential business information only
CREATE OR REPLACE VIEW public.business_directory AS
SELECT 
  id,
  business_name,
  username,
  logo_url,
  theme_color,
  created_at
FROM public.business_owners;

-- Grant public read access to the safe business directory view
GRANT SELECT ON public.business_directory TO anon, authenticated;

-- 3. Secure active_users table - Remove anonymous public access  
DROP POLICY IF EXISTS "Anyone can view active users" ON public.active_users;

-- Create policy for authenticated users only
DROP POLICY IF EXISTS "Authenticated users can view active users" ON public.active_users;
CREATE POLICY "Authenticated users can view active users" ON public.active_users
FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Secure player_stats table - Remove public access to sensitive gaming data
DROP POLICY IF EXISTS "Anyone can view player stats" ON public.player_stats;

-- Create secure public leaderboard view (no user_id exposure)
CREATE OR REPLACE VIEW public.game_leaderboard AS
SELECT 
  points,
  games_played,
  games_won,
  games_lost,
  updated_at
FROM public.player_stats
WHERE points > 0
ORDER BY points DESC
LIMIT 50;

-- Grant public access to safe leaderboard view
GRANT SELECT ON public.game_leaderboard TO anon, authenticated;

-- 5. Add security audit logging table
CREATE TABLE IF NOT EXISTS public.security_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource text,
  details jsonb DEFAULT '{}',
  ip_address inet,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view security audit logs
DROP POLICY IF EXISTS "Admins can view security audit" ON public.security_audit;
CREATE POLICY "Admins can view security audit" ON public.security_audit
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow system to log security events
DROP POLICY IF EXISTS "System can insert security audit" ON public.security_audit;  
CREATE POLICY "System can insert security audit" ON public.security_audit
FOR INSERT WITH CHECK (true);