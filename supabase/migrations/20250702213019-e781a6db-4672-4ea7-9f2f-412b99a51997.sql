-- Fix search path security issues in database functions

-- Fix get_active_users_count function
CREATE OR REPLACE FUNCTION public.get_active_users_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Clean up inactive users first
  PERFORM cleanup_inactive_users();
  
  -- Return count of remaining active users
  RETURN (
    SELECT COUNT(*)::integer 
    FROM active_users
  );
END;
$$;

-- Fix update_last_active function
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.last_active = now();
  RETURN NEW;
END;
$$;

-- Fix cleanup_inactive_users function
CREATE OR REPLACE FUNCTION public.cleanup_inactive_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM active_users
  WHERE last_active < now() - interval '5 minutes';
END;
$$;

-- Fix update_player_stats function
CREATE OR REPLACE FUNCTION public.update_player_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If game is finished
  IF NEW.status = 'finished' AND OLD.status != 'finished' THEN
    -- Update winner stats
    UPDATE player_stats
    SET 
      points = points + 5,
      games_won = games_won + 1,
      games_played = games_played + 1,
      updated_at = now()
    WHERE user_id = NEW.winner;

    -- Update loser stats
    UPDATE player_stats
    SET 
      points = GREATEST(0, points - 5),
      games_lost = games_lost + 1,
      games_played = games_played + 1,
      updated_at = now()
    WHERE user_id IN (
      SELECT user_id FROM game_players
      WHERE room_id = NEW.id AND user_id != NEW.winner
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Fix create_player_stats function
CREATE OR REPLACE FUNCTION public.create_player_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO player_stats (user_id, points, games_played, games_won, games_lost)
  VALUES (NEW.id, 200, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO profiles (user_id, telegram_username, phone_number, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'telegram_username', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  
  -- Assign default user role
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix is_admin function (already has search_path but making it consistent)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- Fix bulk_update_rates function
CREATE OR REPLACE FUNCTION public.bulk_update_rates(rates json[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  rate_record json;
BEGIN
  -- Check if user is admin
  IF (auth.jwt() ->> 'email') != 'admin@mmktoday.com' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  FOREACH rate_record IN ARRAY rates LOOP
    INSERT INTO exchange_rates (
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
$$;

-- Fix bulk_update_gold_prices function
CREATE OR REPLACE FUNCTION public.bulk_update_gold_prices(prices json[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  price_record json;
BEGIN
  -- Check if user is admin
  IF (auth.jwt() ->> 'email') != 'admin@mmktoday.com' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  FOREACH price_record IN ARRAY prices LOOP
    INSERT INTO gold_prices (
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
$$;