-- Fix orders status constraint to allow all valid statuses
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'));

-- Enable realtime for orders table so status changes sync to client
ALTER TABLE orders REPLICA IDENTITY FULL;

-- Add orders table to realtime publication if not already added
ALTER PUBLICATION supabase_realtime ADD TABLE orders;