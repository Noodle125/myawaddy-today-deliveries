-- Fix database function security warnings by setting proper search paths
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, telegram_username, phone_number, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'telegram_username', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Fix other functions with security warnings
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.create_order_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get all admin users
  FOR admin_user_id IN 
    SELECT ur.user_id 
    FROM user_roles ur 
    WHERE ur.role = 'admin'
  LOOP
    -- Create notification for each admin
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      metadata
    ) VALUES (
      admin_user_id,
      '🔔 New Order Received!',
      CASE 
        WHEN NEW.order_type = 'food' THEN 'New food order #' || NEW.id || ' - ' || NEW.total_amount || ' MMK'
        WHEN NEW.order_type = 'shop' THEN 'New shop order #' || NEW.id || ' - ' || NEW.total_amount || ' MMK'
        ELSE 'New order #' || NEW.id || ' - ' || NEW.total_amount || ' MMK'
      END,
      'order',
      jsonb_build_object(
        'order_id', NEW.id,
        'order_type', NEW.order_type,
        'total_amount', NEW.total_amount,
        'user_id', NEW.user_id
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_car_order_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get all admin users
  FOR admin_user_id IN 
    SELECT ur.user_id 
    FROM user_roles ur 
    WHERE ur.role = 'admin'
  LOOP
    -- Create notification for each admin
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      metadata
    ) VALUES (
      admin_user_id,
      '🚗 New Car Order Received!',
      'Car booking: ' || NEW.from_location || ' → ' || NEW.to_location || ' - ' || NEW.price || ' MMK',
      'order',
      jsonb_build_object(
        'car_order_id', NEW.id,
        'from_location', NEW.from_location,
        'to_location', NEW.to_location,
        'price', NEW.price,
        'user_id', NEW.user_id,
        'customer_name', NEW.name,
        'telegram_username', NEW.telegram_username
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;