-- Create a default "Uncategorized" category for each type if it doesn't exist
INSERT INTO categories (name, type)
SELECT 'Uncategorized', DISTINCT type 
FROM categories 
WHERE NOT EXISTS (
  SELECT 1 FROM categories c2 
  WHERE c2.name = 'Uncategorized' AND c2.type = categories.type
)
GROUP BY type;

-- Create function to safely delete categories
CREATE OR REPLACE FUNCTION public.safe_delete_category(category_id uuid)
RETURNS jsonb AS $$
DECLARE
  category_record categories%ROWTYPE;
  uncategorized_id uuid;
  product_count integer;
  result jsonb;
BEGIN
  -- Get category details
  SELECT * INTO category_record FROM categories WHERE id = category_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Category not found');
  END IF;
  
  -- Count products in this category
  SELECT COUNT(*) INTO product_count FROM products WHERE category_id = category_id;
  
  IF product_count > 0 THEN
    -- Find or create uncategorized category for this type
    SELECT id INTO uncategorized_id 
    FROM categories 
    WHERE name = 'Uncategorized' AND type = category_record.type;
    
    IF uncategorized_id IS NULL THEN
      INSERT INTO categories (name, type) 
      VALUES ('Uncategorized', category_record.type)
      RETURNING id INTO uncategorized_id;
    END IF;
    
    -- Move all products to uncategorized
    UPDATE products 
    SET category_id = uncategorized_id 
    WHERE category_id = category_id;
  END IF;
  
  -- Delete the category
  DELETE FROM categories WHERE id = category_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'products_moved', product_count,
    'moved_to_uncategorized', uncategorized_id IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to safely delete products
CREATE OR REPLACE FUNCTION public.safe_delete_product(product_id uuid)
RETURNS jsonb AS $$
DECLARE
  product_record products%ROWTYPE;
  order_count integer;
BEGIN
  -- Get product details
  SELECT * INTO product_record FROM products WHERE id = product_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;
  
  -- Count orders for this product
  SELECT COUNT(*) INTO order_count FROM order_items WHERE product_id = product_id;
  
  -- Store product name in order_items before deleting product
  UPDATE order_items 
  SET product_name = product_record.name,
      product_type = product_record.type,
      product_image = product_record.image_url
  WHERE product_id = product_id AND product_name IS NULL;
  
  -- Delete the product
  DELETE FROM products WHERE id = product_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'order_count', order_count,
    'order_history_preserved', order_count > 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;