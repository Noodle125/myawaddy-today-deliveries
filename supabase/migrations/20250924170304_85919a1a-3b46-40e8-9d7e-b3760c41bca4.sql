-- Fix critical security vulnerability by removing the dangerous policy
-- This policy allows ANY user to read ALL profiles (personal data theft risk)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Verify we have the secure policy in place (this will fail gracefully if it exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can read own profile'
    AND cmd = 'SELECT'
    AND qual = '(auth.uid() = user_id)'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;