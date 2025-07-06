import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, ShoppingBag, Package, FolderPlus, Code, BarChart3 } from 'lucide-react';
import { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

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
  const { unreadCount } = useNotifications();
  
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

  // Refresh dashboard data when notifications are received
  useEffect(() => {
    if (unreadCount > 0) {
      fetchDashboardData();
    }
  }, [unreadCount, fetchDashboardData]);

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
          <TabsTrigger value="orders" className="flex items-center gap-2 relative">
            <ShoppingBag className="h-4 w-4" />
            Orders
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            )}
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