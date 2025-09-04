-- Fix Security Definer View Issues
-- The linter flagged our views as potential security risks

-- 1. Fix business_directory view - Make it explicitly SECURITY INVOKER
DROP VIEW IF EXISTS public.business_directory;
CREATE VIEW public.business_directory 
WITH (security_invoker=true) AS
SELECT 
  id,
  business_name,
  username,
  logo_url,
  theme_color,
  created_at
FROM public.business_owners;

-- Grant explicit permissions
GRANT SELECT ON public.business_directory TO anon, authenticated;

-- 2. Fix game_leaderboard view - Make it explicitly SECURITY INVOKER  
DROP VIEW IF EXISTS public.game_leaderboard;
CREATE VIEW public.game_leaderboard
WITH (security_invoker=true) AS
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

-- Grant explicit permissions
GRANT SELECT ON public.game_leaderboard TO anon, authenticated;

-- 3. Fix function search paths for remaining functions
CREATE OR REPLACE FUNCTION public.extend_bot_expiry(bot_uuid uuid, days integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  UPDATE public.bots
  SET expires_at = expires_at + (days || ' days')::INTERVAL,
      updated_at = now()
  WHERE id = bot_uuid;
$function$;

CREATE OR REPLACE FUNCTION public.bulk_update_rates(rates json[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  rate_record json;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  FOREACH rate_record IN ARRAY rates LOOP
    INSERT INTO public.exchange_rates (
      currency,
      buy_rate,
      sell_rate,
      updated_at
    ) VALUES (
      (rate_record->>'currency')::text,
      (rate_record->>'buy')::text,
      (rate_record->>'sell')::text,
      now()
    )
    ON CONFLICT (currency) DO UPDATE SET
      buy_rate = EXCLUDED.buy_rate,
      sell_rate = EXCLUDED.sell_rate,
      updated_at = EXCLUDED.updated_at;
  END LOOP;

EXCEPTION WHEN OTHERS THEN
  RAISE; -- Re-raise the error to be handled by the caller
END;
$function$;

CREATE OR REPLACE FUNCTION public.bulk_update_gold_prices(prices json[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path TO 'public'
AS $function$
DECLARE
  price_record json;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  FOREACH price_record IN ARRAY prices LOOP
    INSERT INTO public.gold_prices (
      type,
      price,
      change,
      category,
      updated_at
    ) VALUES (
      (price_record->>'type')::text,
      (price_record->>'price')::numeric,
      (price_record->>'change')::numeric,
      (price_record->>'category')::text,
      now()
    )
    ON CONFLICT (type) DO UPDATE SET
      price = EXCLUDED.price,
      change = EXCLUDED.change,
      updated_at = EXCLUDED.updated_at;
  END LOOP;

EXCEPTION WHEN OTHERS THEN
  RAISE; -- Re-raise the error to be handled by the caller
END;
$function$;