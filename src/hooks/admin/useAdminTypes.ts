import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CategoryType {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAdminTypes = () => {
  const [types, setTypes] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTypes = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('category_types')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTypes(data || []);
    } catch (error) {
      console.error('Error fetching category types:', error);
      toast({
        title: "Fetch Failed",
        description: "Failed to fetch category types.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createType = async (name: string, description?: string) => {
    try {
      console.log('Creating type with:', { name: name.trim(), description: description?.trim() });
      
      const { error } = await supabase
        .from('category_types')
        .insert({
          name: name.trim(),
          description: description?.trim() || null,
        });

      if (error) throw error;

      toast({
        title: "Type Created",
        description: `Category type "${name}" has been created successfully.`,
      });

      fetchTypes();
    } catch (error) {
      console.error('Error creating category type:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create category type.",
        variant: "destructive",
      });
    }
  };

  const updateType = async (id: string, name: string, description?: string) => {
    try {
      console.log('Updating type with:', { id, name: name.trim(), description: description?.trim() });
      
      const { error } = await supabase
        .from('category_types')
        .update({
          name: name.trim(),
          description: description?.trim() || null,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Type Updated",
        description: "Category type has been updated successfully.",
      });

      fetchTypes();
    } catch (error) {
      console.error('Error updating category type:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update category type.",
        variant: "destructive",
      });
    }
  };

  const toggleTypeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('category_types')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Type Updated",
        description: "Category type status has been updated successfully.",
      });

      fetchTypes();
    } catch (error) {
      console.error('Error updating category type status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update category type status.",
        variant: "destructive",
      });
    }
  };

  const deleteType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('category_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Type Deleted",
        description: "Category type has been deleted successfully.",
      });

      fetchTypes();
    } catch (error) {
      console.error('Error deleting category type:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete category type. It may be in use by existing categories or products.",
        variant: "destructive",
      });
    }
  };

  return {
    types,
    loading,
    fetchTypes,
    createType,
    updateType,
    toggleTypeStatus,
    deleteType
  };
};