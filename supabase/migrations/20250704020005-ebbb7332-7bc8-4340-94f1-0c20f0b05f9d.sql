-- Drop the existing constraint that's blocking the insertion
ALTER TABLE car_orders DROP CONSTRAINT IF EXISTS car_orders_location_type_check;

-- Add the correct constraint with the proper values
ALTER TABLE car_orders ADD CONSTRAINT car_orders_location_type_check 
CHECK (location_type IN ('city', 'airport', 'intercity'));