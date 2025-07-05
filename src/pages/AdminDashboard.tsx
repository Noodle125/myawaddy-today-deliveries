import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, ShoppingBag, Package, FolderPlus, Code, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Import refactored components
import { DashboardStats } from '@/components/admin/DashboardStats';
import { UserManagement } from '@/components/admin/UserManagement';
import { OrderManagement } from '@/components/admin/OrderManagement';
import { ProductManagement } from '@/components/admin/ProductManagement';
import { CategoryManagement } from '@/components/admin/CategoryManagement';
import { CodeManagement } from '@/components/admin/CodeManagement';
import { Analytics } from '@/components/admin/Analytics';

// Import custom hooks
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useAdminActions } from '@/hooks/useAdminActions';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [lastOrderCount, setLastOrderCount] = useState(0);
  
  const { 
    stats, 
    users, 
    orders, 
    products, 
    codes, 
    categories, 
    loading, 
    fetchDashboardData 
  } = useAdminDashboard(user, isAdmin);
  
  const {
    updateOrderStatus,
    generateCashbackCodes,
    toggleProductStatus,
    createCategory,
    createProduct
  } = useAdminActions(orders, fetchDashboardData);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(console.error);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Set up real-time notifications for new orders
  useEffect(() => {
    if (!user || !isAdmin) return;

    // Initialize last order count
    if (orders.length > 0 && lastOrderCount === 0) {
      setLastOrderCount(orders.length);
      return;
    }

    // Check for new orders
    if (orders.length > lastOrderCount && lastOrderCount > 0) {
      const newOrdersCount = orders.length - lastOrderCount;
      
      // Show notification
      toast({
        title: "New Order Received! 🔔",
        description: `${newOrdersCount} new order${newOrdersCount > 1 ? 's' : ''} received`,
        duration: 5000,
      });

      // Play notification sound
      playNotificationSound();
      
      setLastOrderCount(orders.length);
    }
  }, [orders.length, lastOrderCount, user, isAdmin, toast]);

  // Set up real-time subscription for orders
  useEffect(() => {
    if (!user || !isAdmin) return;

    const channel = supabase
      .channel('admin-new-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('New order received:', payload);
          // Refresh dashboard data
          fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'car_orders'
        },
        (payload) => {
          console.log('New car order received:', payload);
          // Refresh dashboard data
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, fetchDashboardData]);

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