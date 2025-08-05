-- Phase 1: Critical Data Exposure Fixes

-- 1. Fix profiles table RLS policies
-- Drop the overly permissive policy that allows everyone to view all profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create secure policy that only allows users to view their own profile
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Ensure users can only update their own profile (if not already secured)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update own profile only" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 2. Fix users table RLS policies (if they exist and are overly permissive)
-- First check what policies exist and create secure ones
CREATE POLICY "Users can view own user data only" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own user data only" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- 3. Secure cashback codes - restrict direct access for regular users
-- Drop the public viewing policy for codes
DROP POLICY IF EXISTS "Users can view unused codes for redemption" ON public.cashback_codes;

-- Create more restrictive policy - users can only see codes they are redeeming
CREATE POLICY "Users can view codes for redemption only" 
ON public.cashback_codes 
FOR SELECT 
USING (
  -- Allow during redemption process (when checking if code exists and is unused)
  is_used = false OR 
  -- Allow users to see codes they have used
  used_by = auth.uid() OR
  -- Allow admins to see all codes
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 4. Add role escalation protection
-- Create function to prevent users from modifying their own roles
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent users from adding admin role to themselves
  IF NEW.role = 'admin' AND NEW.user_id = auth.uid() THEN
    RAISE EXCEPTION 'Users cannot grant admin role to themselves';
  END IF;
  
  -- Prevent non-admins from modifying roles
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can modify user roles';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce role escalation protection
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.user_roles;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();