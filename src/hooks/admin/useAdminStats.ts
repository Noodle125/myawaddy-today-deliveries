import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats } from '@/types/admin';

export const useAdminStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalCarOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    activeRewards: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      // Fetch stats sequentially to avoid overwhelming the connection
      const usersCount = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      if (usersCount.error) throw usersCount.error;
      
      const ordersCount = await supabase.from('orders').select('*', { count: 'exact', head: true });
      if (ordersCount.error) throw ordersCount.error;
      
      const carOrdersCount = await supabase.from('car_orders').select('*', { count: 'exact', head: true });
      if (carOrdersCount.error) throw carOrdersCount.error;
      
      const productsCount = await supabase.from('products').select('*', { count: 'exact', head: true });
      if (productsCount.error) throw productsCount.error;
      
      const pendingOrdersCount = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      if (pendingOrdersCount.error) throw pendingOrdersCount.error;
      
      const activeRewardsCount = await supabase.from('user_rewards').select('*', { count: 'exact', head: true }).eq('is_redeemed', false);
      if (activeRewardsCount.error) throw activeRewardsCount.error;

      setStats({
        totalUsers: usersCount.count || 0,
        totalOrders: ordersCount.count || 0,
        totalCarOrders: carOrdersCount.count || 0,
        totalProducts: productsCount.count || 0,
        pendingOrders: pendingOrdersCount.count || 0,
        activeRewards: activeRewardsCount.count || 0,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  }, []);

  return { stats, fetchStats };
};