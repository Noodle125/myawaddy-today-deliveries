-- Make profile fields nullable so users can save partial information
ALTER TABLE public.profiles 
ALTER COLUMN telegram_username DROP NOT NULL,
ALTER COLUMN phone_number DROP NOT NULL;

-- Make username nullable in users table  
ALTER TABLE public.users
ALTER COLUMN username DROP NOT NULL;