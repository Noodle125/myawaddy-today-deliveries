import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  ShoppingBag, 
  Car, 
  Gift, 
  BarChart3, 
  Settings, 
  FileText,
  Code,
  TrendingUp,
  UserPlus,
  Package
} from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [newCodeType, setNewCodeType] = useState('');
  const [newCodeCount, setNewCodeCount] = useState(1);

  useEffect(() => {
    if (user && isAdmin) {
      fetchDashboardData();
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

      // Fetch recent users
      const { data: usersData } = await supabase
        .from('users')
        .select(`
          id,
          username,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (usersData) {
        setUsers(usersData);
      }

      // Fetch recent orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          id,
          order_type,
          status,
          total_amount,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersData) {
        setOrders(ordersData);
      }

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
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
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

  const generateCashbackCodes = async () => {
    if (!newCodeType || newCodeCount < 1) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid code type and count.",
        variant: "destructive",
      });
      return;
    }

    try {
      const codes = [];
      for (let i = 0; i < newCodeCount; i++) {
        const code = `${newCodeType.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        codes.push({
          code,
          type: newCodeType,
        });
      }

      const { error } = await supabase
        .from('cashback_codes')
        .insert(codes);

      if (error) throw error;

      toast({
        title: "Codes Generated",
        description: `Successfully generated ${newCodeCount} cashback codes.`,
      });

      setNewCodeType('');
      setNewCodeCount(1);
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
        <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Car Orders</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCarOrders}</div>
            <p className="text-xs text-muted-foreground">
              Total car bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Available products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rewards</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRewards}</div>
            <p className="text-xs text-muted-foreground">
              In progress rewards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${orders.reduce((sum, order) => sum + Number(order.total_amount), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Recent orders total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
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
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">User ID: {user.id.slice(0, 8)}...</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">user</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{order.order_type}</p>
                      <p className="text-sm text-muted-foreground">
                        User ID: {order.user_id.slice(0, 8)}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">${order.total_amount}</p>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.type}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(product.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">${product.price}</p>
                      <Button
                        variant={product.is_active ? "default" : "secondary"}
                        size="sm"
                        onClick={() => toggleProductStatus(product.id, product.is_active)}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="codes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Cashback Codes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Code Type</Label>
                  <Input
                    placeholder="e.g., CASHBACK, REWARD"
                    value={newCodeType}
                    onChange={(e) => setNewCodeType(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Count</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={newCodeCount}
                    onChange={(e) => setNewCodeCount(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button onClick={generateCashbackCodes} className="w-full">
                    Generate Codes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {codes.map((code) => (
                  <div key={code.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={code.is_used ? "secondary" : "default"}>
                        {code.type}
                      </Badge>
                      {code.is_used && <Badge variant="outline">Used</Badge>}
                    </div>
                    <p className="font-mono text-sm">{code.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(code.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Order Success Rate</p>
                    <p className="text-2xl font-bold">
                      {orders.length > 0 
                        ? Math.round((orders.filter(o => o.status === 'completed').length / orders.length) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Average Order Value</p>
                    <p className="text-2xl font-bold">
                      ${orders.length > 0 
                        ? (orders.reduce((sum, order) => sum + Number(order.total_amount), 0) / orders.length).toFixed(2)
                        : '0.00'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Order Status Distribution</p>
                  <div className="space-y-2">
                    {['pending', 'processing', 'completed', 'cancelled'].map((status) => {
                      const count = orders.filter(o => o.status === status).length;
                      const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <span className="capitalize">{status}</span>
                          <span>{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;