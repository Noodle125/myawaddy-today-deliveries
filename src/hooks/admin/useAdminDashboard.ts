import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminStats } from './useAdminStats';
import { useAdminUsers } from './useAdminUsers';
import { useAdminOrders } from './useAdminOrders';
import { useAdminProducts } from './useAdminProducts';
import { useAdminCodes } from './useAdminCodes';
import { useAdminCategories } from './useAdminCategories';
import { useAdminTypes } from './useAdminTypes';

export const useAdminDashboard = (user: any, isAdmin: boolean) => {
  const [loading, setLoading] = useState(true);
  
  const { stats, fetchStats } = useAdminStats();
  const { users, fetchUsers } = useAdminUsers();
  const { orders, fetchOrders } = useAdminOrders();
  const { products, fetchProducts } = useAdminProducts();
  const { codes, fetchCodes } = useAdminCodes();
  const { categories, fetchCategories } = useAdminCategories();
  const { types, fetchTypes } = useAdminTypes();

  const fetchDashboardData = useCallback(async (retries = 3) => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching dashboard data...');
      
      // Fetch all data in parallel for better performance
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchOrders(),
        fetchProducts(),
        fetchCodes(),
        fetchCategories(),
        fetchTypes()
      ]);
      
      console.log('Dashboard data fetched successfully');
    } catch (error) {
      console.error('Error fetching dashboard data (attempt', 4 - retries, '):', error);
      
      if (retries > 0) {
        console.log('Retrying dashboard fetch in 2 seconds...');
        setTimeout(() => fetchDashboardData(retries - 1), 2000);
        return;
      }
      
      // If all retries failed, show fallback data
      console.log('All dashboard fetch retries failed, showing fallback data');
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, fetchStats, fetchUsers, fetchOrders, fetchProducts, fetchCodes, fetchCategories, fetchTypes]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchDashboardData();
      
      // Set up realtime subscription for orders
      const channel = supabase
        .channel('admin-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders'
          },
          (payload) => {
            console.log('Order change:', payload);
            fetchDashboardData(); // Refresh dashboard data when orders change
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, isAdmin, fetchDashboardData]);

  return {
    stats,
    users,
    orders,
    products,
    codes,
    categories,
    types,
    loading,
    fetchDashboardData
  };
};