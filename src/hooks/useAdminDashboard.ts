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

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [
        { count: usersCount },
        { count: ordersCount },
        { count: carOrdersCount },
        { count: productsCount },
        { count: pendingOrdersCount },
        { count: activeRewardsCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('car_orders').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('user_rewards').select('*', { count: 'exact', head: true }).eq('is_redeemed', false),
      ]);

      setStats({
        totalUsers: usersCount || 0,
        totalOrders: ordersCount || 0,
        totalCarOrders: carOrdersCount || 0,
        totalProducts: productsCount || 0,
        pendingOrders: pendingOrdersCount || 0,
        activeRewards: activeRewardsCount || 0,
      });

      // Fetch recent users with profile information
      const { data: usersData } = await supabase
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

      // Fetch profiles for additional user info
      const { data: profilesData } = await supabase
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

      // Combine users with profile data
      if (usersData && profilesData) {
        const combinedUsers = usersData.map(user => {
          const profile = profilesData.find(p => p.user_id === user.id);
          return {
            ...user,
            profile_display_name: profile?.display_name,
            phone_number: profile?.phone_number,
            telegram_username: profile?.telegram_username,
            profile_picture_url: profile?.profile_picture_url
          };
        });
        setUsers(combinedUsers);
      } else if (usersData) {
        setUsers(usersData);
      }

      // Fetch recent orders with more details
      const [ordersResult, carOrdersResult, orderItemsResult] = await Promise.all([
        supabase
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
          .limit(10),
        supabase
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
          .limit(10),
        supabase
          .from('order_items')
          .select(`
            order_id,
            quantity,
            price,
            products (
              name,
              type
            )
          `)
      ]);

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
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (productsData) {
        setProducts(productsData);
      }

      // Fetch cashback codes
      const { data: codesData } = await supabase
        .from('cashback_codes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (codesData) {
        setCodes(codesData);
      }

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (categoriesData) {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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