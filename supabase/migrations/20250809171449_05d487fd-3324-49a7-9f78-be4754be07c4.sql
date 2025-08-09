-- Update create_order_notification function to include product details
CREATE OR REPLACE FUNCTION public.create_order_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_user_id UUID;
  order_items_data JSONB;
  total_products INTEGER;
BEGIN
  -- Get order items with product details
  SELECT 
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'quantity', oi.quantity,
        'price', oi.price,
        'product_name', COALESCE(p.name, 'Unknown Product'),
        'product_image', COALESCE(p.image_url, '/placeholder.svg'),
        'product_type', COALESCE(p.type, 'product')
      )
    ), '[]'::jsonb),
    COALESCE(COUNT(*), 0)
  INTO order_items_data, total_products
  FROM order_items oi
  LEFT JOIN products p ON oi.product_id = p.id
  WHERE oi.order_id = NEW.id;

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
      '🛍️ New Order Received!',
      CASE 
        WHEN NEW.order_type = 'food' THEN 
          'New food order #' || SUBSTRING(NEW.id::text, 1, 8) || ' - ' || total_products || ' item(s) - ' || NEW.total_amount || ' MMK'
        WHEN NEW.order_type = 'shop' THEN 
          'New shop order #' || SUBSTRING(NEW.id::text, 1, 8) || ' - ' || total_products || ' item(s) - ' || NEW.total_amount || ' MMK'
        ELSE 
          'New order #' || SUBSTRING(NEW.id::text, 1, 8) || ' - ' || total_products || ' item(s) - ' || NEW.total_amount || ' MMK'
      END,
      'order',
      jsonb_build_object(
        'order_id', NEW.id,
        'order_type', NEW.order_type,
        'total_amount', NEW.total_amount,
        'user_id', NEW.user_id,
        'items', order_items_data,
        'item_count', total_products,
        'delivery_address', NEW.delivery_address
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;