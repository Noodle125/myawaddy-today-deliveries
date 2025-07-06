import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats, User, Order, Product, CashbackCode, Category } from '@/types/admin';

export const useAdminDashboard = (user: any, isAdmin: boolean) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalCarOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    activeRewards: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [codes, setCodes] = useState<CashbackCode[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (retries = 3) => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching dashboard data...');
      
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

      // Fetch recent users with profile information
      const usersResult = await supabase
        .from('users')
        .select(`
          id,
          username,
          created_at,
          display_name,
          bio
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (usersResult.error) throw usersResult.error;

      // Fetch profiles for additional user info
      const profilesResult = await supabase
        .from('profiles')
        .select(`
          user_id,
          display_name,
          phone_number,
          telegram_username,
          profile_picture_url
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (profilesResult.error) throw profilesResult.error;

      // Combine users with profile data
      if (usersResult.data && profilesResult.data) {
        const combinedUsers = usersResult.data.map(user => {
          const profile = profilesResult.data.find(p => p.user_id === user.id);
          return {
            ...user,
            profile_display_name: profile?.display_name,
            phone_number: profile?.phone_number,
            telegram_username: profile?.telegram_username,
            profile_picture_url: profile?.profile_picture_url
          };
        });
        setUsers(combinedUsers);
      } else if (usersResult.data) {
        setUsers(usersResult.data);
      }

      // Fetch recent orders with more details - sequential to avoid overwhelming connection
      const ordersResult = await supabase
        .from('orders')
        .select(`
          id,
          order_type,
          status,
          total_amount,
          created_at,
          updated_at,
          user_id,
          delivery_address
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (ordersResult.error) throw ordersResult.error;

      const carOrdersResult = await supabase
        .from('car_orders')
        .select(`
          id,
          status,
          price,
          created_at,
          updated_at,
          user_id,
          from_location,
          to_location,
          name,
          telegram_username,
          people_count,
          location_type
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (carOrdersResult.error) throw carOrdersResult.error;

      const orderItemsResult = await supabase
        .from('order_items')
        .select(`
          order_id,
          quantity,
          price,
          products (
            name,
            type
          )
        `);
      
      if (orderItemsResult.error) throw orderItemsResult.error;

      // Combine regular orders and car orders with enhanced data
      const regularOrdersWithItems = (ordersResult.data || []).map(order => {
        const items = (orderItemsResult.data || []).filter(item => item.order_id === order.id);
        return {
          ...order,
          items: items.map(item => ({
            quantity: item.quantity,
            price: item.price,
            product_name: item.products?.name,
            product_type: item.products?.type
          }))
        };
      });

      const carOrdersFormatted = (carOrdersResult.data || []).map(carOrder => ({
        id: carOrder.id,
        order_type: 'car',
        status: carOrder.status,
        total_amount: carOrder.price,
        created_at: carOrder.created_at,
        updated_at: carOrder.updated_at,
        user_id: carOrder.user_id,
        from_location: carOrder.from_location,
        to_location: carOrder.to_location,
        customer_name: carOrder.name,
        telegram_username: carOrder.telegram_username,
        people_count: carOrder.people_count,
        location_type: carOrder.location_type
      }));

      const allOrders = [
        ...regularOrdersWithItems,
        ...carOrdersFormatted
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setOrders(allOrders);

      // Fetch products
      const productsResult = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (productsResult.error) throw productsResult.error;
      if (productsResult.data) {
        setProducts(productsResult.data);
      }

      // Fetch cashback codes
      const codesResult = await supabase
        .from('cashback_codes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (codesResult.error) throw codesResult.error;
      if (codesResult.data) {
        setCodes(codesResult.data);
      }

      // Fetch categories
      const categoriesResult = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (categoriesResult.error) throw categoriesResult.error;
      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }
      
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
  };

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
  }, [user, isAdmin]);

  return {
    stats,
    users,
    orders,
    products,
    codes,
    categories,
    loading,
    fetchDashboardData
  };
};