import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/admin';

export const useAdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const categoriesResult = await supabase
        .from('categories')
        .select(`
          *,
          category_types!fk_categories_category_type_id(
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (categoriesResult.error) throw categoriesResult.error;
      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }
    } catch (error) {
      console.error('Error fetching admin categories:', error);
    }
  }, []);

  return { categories, fetchCategories };
};