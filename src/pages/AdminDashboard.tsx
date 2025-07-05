import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Settings, Users, ShoppingBag, Package, FolderPlus, Code, BarChart3 } from 'lucide-react';

// Import refactored components
import { DashboardStats } from '@/components/admin/DashboardStats';
import { UserManagement } from '@/components/admin/UserManagement';
import { OrderManagement } from '@/components/admin/OrderManagement';
import { ProductManagement } from '@/components/admin/ProductManagement';
import { CategoryManagement } from '@/components/admin/CategoryManagement';
import { CodeManagement } from '@/components/admin/CodeManagement';
import { Analytics } from '@/components/admin/Analytics';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalCarOrders: number;
  totalProducts: number;
  pendingOrders: number;
  activeRewards: number;
}

interface User {
  id: string;
  username: string;
  created_at: string;
}

interface Order {
  id: string;
  order_type: string;
  status: string;
  total_amount: number;
  created_at: string;
  user_id: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  type: string;
  is_active: boolean;
  created_at: string;
}

interface CashbackCode {
  id: string;
  code: string;
  type: string;
  is_used: boolean;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Find the order to determine if it's a car order or regular order
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error('Order not found');

      const tableName = order.order_type === 'car' ? 'car_orders' : 'orders';
      
      const { error } = await supabase
        .from(tableName)
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order Updated",
        description: "Order status has been successfully updated.",
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  const generateCashbackCodes = async (codeType: string, codeCount: number) => {
    if (!codeType || codeCount < 1) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid code type and count.",
        variant: "destructive",
      });
      return;
    }

    try {
      const codes = [];
      for (let i = 0; i < codeCount; i++) {
        const code = `${codeType.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        codes.push({
          code,
          type: codeType,
        });
      }

      const { error } = await supabase
        .from('cashback_codes')
        .insert(codes);

      if (error) throw error;

      toast({
        title: "Codes Generated",
        description: `Successfully generated ${codeCount} cashback codes.`,
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error generating codes:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate cashback codes.",
        variant: "destructive",
      });
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Product Updated",
        description: "Product status has been successfully updated.",
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update product status.",
        variant: "destructive",
      });
    }
  };

  const createCategory = async (name: string, type: string) => {
    if (!name.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          name,
          type,
        });

      if (error) throw error;

      toast({
        title: "Category Created",
        description: `Category "${name}" has been created successfully.`,
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create category.",
        variant: "destructive",
      });
    }
  };

  const createProduct = async (productData: any) => {
    if (!productData.name.trim() || !productData.price || !productData.category_id) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          description: productData.description,
          price: parseFloat(productData.price),
          image_url: productData.image_url,
          category_id: productData.category_id,
          type: productData.type,
        });

      if (error) throw error;

      toast({
        title: "Product Created",
        description: `Product "${productData.name}" has been created successfully.`,
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create product.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">Admin privileges required to access this dashboard.</p>
          {!user && <p className="text-sm text-muted-foreground">You are not logged in.</p>}
          {user && !isAdmin && <p className="text-sm text-muted-foreground">Your account does not have admin privileges.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <DashboardStats stats={stats} orders={orders} />

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderPlus className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="codes" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Codes
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserManagement users={users} />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <OrderManagement orders={orders} onUpdateOrderStatus={updateOrderStatus} />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <ProductManagement 
            products={products} 
            categories={categories}
            onCreateProduct={createProduct}
            onToggleProductStatus={toggleProductStatus}
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CategoryManagement 
            categories={categories} 
            onCreateCategory={createCategory}
          />
        </TabsContent>

        <TabsContent value="codes" className="space-y-4">
          <CodeManagement 
            codes={codes} 
            onGenerateCodes={generateCashbackCodes}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Analytics orders={orders} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;