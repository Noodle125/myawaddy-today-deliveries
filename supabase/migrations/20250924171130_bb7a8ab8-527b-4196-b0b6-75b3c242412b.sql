-- Phase 1: Fix Foreign Key Relationships and Database Structure

-- Fix the categories table to use category_type_id instead of type string
ALTER TABLE categories ADD COLUMN IF NOT EXISTS category_type_id UUID;

-- Update existing categories to reference proper category type IDs
UPDATE categories SET category_type_id = (
  SELECT ct.id FROM category_types ct WHERE ct.name = categories.type
) WHERE category_type_id IS NULL;

-- Add foreign key constraint
ALTER TABLE categories ADD CONSTRAINT fk_categories_category_type_id 
  FOREIGN KEY (category_type_id) REFERENCES category_types(id);

-- Fix the products table to ensure proper category relationship
ALTER TABLE products ADD CONSTRAINT fk_products_category_id 
  FOREIGN KEY (category_id) REFERENCES categories(id);

-- Create improved safe delete function for category types
CREATE OR REPLACE FUNCTION public.safe_delete_category_type(type_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  type_record category_types%ROWTYPE;
  category_count integer;
  product_count integer;
  uncategorized_type_id uuid;
  uncategorized_category_id uuid;
BEGIN
  -- Get category type details
  SELECT * INTO type_record FROM category_types WHERE id = type_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Category type not found');
  END IF;
  
  -- Count categories of this type
  SELECT COUNT(*) INTO category_count FROM categories WHERE category_type_id = type_id;
  
  -- Count products in categories of this type
  SELECT COUNT(*) INTO product_count 
  FROM products p 
  JOIN categories c ON p.category_id = c.id 
  WHERE c.category_type_id = type_id;
  
  IF category_count > 0 OR product_count > 0 THEN
    -- Find or create "General" category type
    SELECT id INTO uncategorized_type_id 
    FROM category_types 
    WHERE name = 'General';
    
    IF uncategorized_type_id IS NULL THEN
      INSERT INTO category_types (name, description, is_active) 
      VALUES ('General', 'General purpose category type', true)
      RETURNING id INTO uncategorized_type_id;
    END IF;
    
    -- Find or create "Uncategorized" category under General type
    SELECT id INTO uncategorized_category_id 
    FROM categories 
    WHERE name = 'Uncategorized' AND category_type_id = uncategorized_type_id;
    
    IF uncategorized_category_id IS NULL THEN
      INSERT INTO categories (name, category_type_id) 
      VALUES ('Uncategorized', uncategorized_type_id)
      RETURNING id INTO uncategorized_category_id;
    END IF;
    
    -- Move products to uncategorized category
    UPDATE products 
    SET category_id = uncategorized_category_id 
    WHERE category_id IN (
      SELECT id FROM categories WHERE category_type_id = type_id
    );
    
    -- Move categories to General type
    UPDATE categories 
    SET category_type_id = uncategorized_type_id 
    WHERE category_type_id = type_id;
  END IF;
  
  -- Delete the category type
  DELETE FROM category_types WHERE id = type_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'categories_moved', category_count,
    'products_moved', product_count,
    'moved_to_general', uncategorized_type_id IS NOT NULL
  );
END;
$$;

-- Fix the existing safe_delete_category function to avoid parameter naming conflicts
DROP FUNCTION IF EXISTS public.safe_delete_category(uuid);
CREATE OR REPLACE FUNCTION public.safe_delete_category(cat_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  category_record categories%ROWTYPE;
  uncategorized_id uuid;
  product_count integer;
  result jsonb;
BEGIN
  -- Get category details
  SELECT * INTO category_record FROM categories WHERE id = cat_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Category not found');
  END IF;
  
  -- Count products in this category
  SELECT COUNT(*) INTO product_count FROM products WHERE category_id = cat_id;
  
  IF product_count > 0 THEN
    -- Find or create uncategorized category for this type
    SELECT c.id INTO uncategorized_id 
    FROM categories c
    WHERE c.name = 'Uncategorized' AND c.category_type_id = category_record.category_type_id;
    
    IF uncategorized_id IS NULL THEN
      INSERT INTO categories (name, category_type_id) 
      VALUES ('Uncategorized', category_record.category_type_id)
      RETURNING id INTO uncategorized_id;
    END IF;
    
    -- Move all products to uncategorized
    UPDATE products 
    SET category_id = uncategorized_id 
    WHERE category_id = cat_id;
  END IF;
  
  -- Delete the category
  DELETE FROM categories WHERE id = cat_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'products_moved', product_count,
    'moved_to_uncategorized', uncategorized_id IS NOT NULL
  );
END;
$$;

-- Fix the safe_delete_product function to avoid parameter naming conflicts
DROP FUNCTION IF EXISTS public.safe_delete_product(uuid);
CREATE OR REPLACE FUNCTION public.safe_delete_product(prod_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  product_record products%ROWTYPE;
  order_count integer;
BEGIN
  -- Get product details
  SELECT * INTO product_record FROM products WHERE id = prod_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;
  
  -- Count orders for this product
  SELECT COUNT(*) INTO order_count FROM order_items WHERE product_id = prod_id;
  
  -- Store product name in order_items before deleting product
  UPDATE order_items 
  SET product_name = product_record.name,
      product_type = product_record.type,
      product_image = product_record.image_url
  WHERE product_id = prod_id AND product_name IS NULL;
  
  -- Delete the product
  DELETE FROM products WHERE id = prod_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'order_count', order_count,
    'order_history_preserved', order_count > 0
  );
END;
$$;

-- Add proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_category_type_id ON categories(category_type_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Add update triggers for timestamps
CREATE OR REPLACE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ensure we have a General category type
INSERT INTO category_types (name, description, is_active) 
VALUES ('General', 'General purpose category type for uncategorized items', true)
ON CONFLICT (name) DO NOTHING;