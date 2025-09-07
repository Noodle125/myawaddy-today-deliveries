-- Add new columns to car_orders table for trip type and city trip functionality
ALTER TABLE car_orders 
ADD COLUMN trip_type text NOT NULL DEFAULT 'one-way',
ADD COLUMN is_city_trip boolean NOT NULL DEFAULT false;

-- Add check constraint for trip_type
ALTER TABLE car_orders 
ADD CONSTRAINT car_orders_trip_type_check 
CHECK (trip_type IN ('one-way', 'round-trip'));

-- Update existing records to have default values
UPDATE car_orders 
SET trip_type = 'one-way', is_city_trip = false 
WHERE trip_type IS NULL OR is_city_trip IS NULL;