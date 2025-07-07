import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/admin';

export const useAdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      const productsResult = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (productsResult.error) throw productsResult.error;
      if (productsResult.data) {
        setProducts(productsResult.data);
      }
    } catch (error) {
      console.error('Error fetching admin products:', error);
    }
  }, []);

  return { products, fetchProducts };
};