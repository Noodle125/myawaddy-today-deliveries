-- Create notifications table for real-time notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'order', 'success', 'warning', 'error'
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb -- For storing additional data like order_id, etc.
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications for all users" 
ON public.notifications 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create notifications for new orders
CREATE OR REPLACE FUNCTION public.create_order_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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
    INSERT INTO public.notifications (
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

-- Create trigger for new orders
CREATE TRIGGER create_notification_on_new_order
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.create_order_notification();

-- Create function for car order notifications
CREATE OR REPLACE FUNCTION public.create_car_order_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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
    INSERT INTO public.notifications (
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

-- Create trigger for new car orders
CREATE TRIGGER create_notification_on_new_car_order
AFTER INSERT ON public.car_orders
FOR EACH ROW
EXECUTE FUNCTION public.create_car_order_notification();