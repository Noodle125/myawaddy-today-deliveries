
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types/admin';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OrderManagementProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: string) => void;
}

interface CustomerProfile {
  user_id: string;
  display_name: string | null;
  phone_number: string;
  telegram_username: string;
  username?: string;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'completed': return 'default';
    case 'processing': return 'secondary';
    case 'cancelled': return 'destructive';
    case 'pending': return 'outline';
    default: return 'outline';
  }
};

export const OrderManagement = ({ orders, onUpdateOrderStatus }: OrderManagementProps) => {
  const [customerProfiles, setCustomerProfiles] = useState<{[key: string]: CustomerProfile}>({});

  useEffect(() => {
    const fetchCustomerProfiles = async () => {
      const userIds = orders
        .filter(order => order.order_type !== 'car')
        .map(order => order.user_id);
      
      if (userIds.length === 0) return;

      // Fetch user info (users table has the main user data)
      const usersResponse = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, created_at, bio, age, gender, relationship_status')
        .in('id', userIds);

      if (usersResponse.data) {
        const profilesMap: {[key: string]: CustomerProfile} = {};
        
        usersResponse.data.forEach(user => {
          profilesMap[user.id] = {
            user_id: user.id,
            display_name: user.display_name,
            phone_number: '', // Not available in users table
            telegram_username: user.username || '',
            username: user.username
          };
        });
        
        setCustomerProfiles(profilesMap);
      }
    };

    fetchCustomerProfiles();
  }, [orders]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders ({orders.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {order.order_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        #{order.id.slice(0, 8)}
                      </span>
                    </div>
                    <p className="font-medium text-foreground capitalize">{order.order_type} Order</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                    {order.delivery_address && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📍 {order.delivery_address}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground text-lg">{order.total_amount.toLocaleString()} MMK</p>
                    <Badge variant={getStatusBadgeVariant(order.status)} className="mb-2">
                      {order.status}
                    </Badge>
                    <div>
                      <Select
                        value={order.status}
                        onValueChange={(value) => onUpdateOrderStatus(order.id, value)}
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
                </div>
                
                {/* Customer Information */}
                {order.order_type === 'car' ? (
                  <div className="p-4 border-b border-border">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Customer Information:</h4>
                    <div className="space-y-1">
                      <p className="text-sm"><span className="font-medium">Name:</span> {order.customer_name}</p>
                      <p className="text-sm"><span className="font-medium">Contact:</span> @{order.telegram_username}</p>
                      <p className="text-sm"><span className="font-medium">People:</span> {order.people_count}</p>
                      <p className="text-sm"><span className="font-medium">Type:</span> {order.location_type}</p>
                      <p className="text-sm"><span className="font-medium">Route:</span> {order.from_location} → {order.to_location}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-b border-border">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Customer Information:</h4>
                    {customerProfiles[order.user_id] ? (
                      <div className="space-y-1">
                        <p className="text-sm"><span className="font-medium">Name:</span> {customerProfiles[order.user_id].display_name || customerProfiles[order.user_id].username || 'N/A'}</p>
                        <p className="text-sm"><span className="font-medium">Phone:</span> {customerProfiles[order.user_id].phone_number || 'N/A'}</p>
                        <p className="text-sm"><span className="font-medium">Telegram:</span> @{customerProfiles[order.user_id].telegram_username || 'N/A'}</p>
                        <p className="text-sm"><span className="font-medium">Username:</span> {customerProfiles[order.user_id].username || 'N/A'}</p>
                      </div>
                    ) : (
                      <p className="text-sm">Loading...</p>
                    )}
                  </div>
                )}

                {/* Product Details - Only for shop/food orders */}
                {order.order_type !== 'car' && (
                  <div className="p-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">Items Ordered:</h4>
                    <OrderItemsList key={order.id} order={order} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function OrderItemsList({ order }: { order: Order }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadOrderItems = async () => {
      if (order.order_type === 'car') {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        console.log('[OrderItemsList] Loading items for order:', order.id);
        
        // First, get order items
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        if (cancelled) return;

        if (itemsError) {
          console.error('[OrderItemsList] Error fetching order items:', itemsError);
          setItems([]);
          setLoading(false);
          return;
        }

        console.log('[OrderItemsList] Raw order items:', orderItems);

        if (!orderItems || orderItems.length === 0) {
          console.log('[OrderItemsList] No order items found for order:', order.id);
          setItems([]);
          setLoading(false);
          return;
        }

        // Get unique product IDs
        const productIds = [...new Set(orderItems.map(item => item.product_id).filter(Boolean))];
        console.log('[OrderItemsList] Product IDs to fetch:', productIds);
        
        if (productIds.length === 0) {
          console.log('[OrderItemsList] No valid product IDs found');
          const itemsWithoutProducts = orderItems.map(item => ({
            ...item,
            product: {
              name: 'Unknown Product',
              image_url: '/placeholder.svg',
              type: 'product'
            }
          }));
          setItems(itemsWithoutProducts);
          setLoading(false);
          return;
        }

        // Fetch products - simplified query to avoid RLS issues
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, name, image_url, type')
          .in('id', productIds);

        if (cancelled) return;

        console.log('[OrderItemsList] Products fetched:', products);

        if (productsError) {
          console.error('[OrderItemsList] Error fetching products:', productsError);
        }

        // Create product lookup map
        const productMap = (products || []).reduce((acc, product) => {
          acc[product.id] = product;
          return acc;
        }, {} as Record<string, any>);

        console.log('[OrderItemsList] Product map:', productMap);

        // Combine order items with product details
        const itemsWithProducts = orderItems.map(item => {
          const product = productMap[item.product_id];
          console.log(`[OrderItemsList] Item ${item.id} product:`, product);
          
          return {
            ...item,
            product: product || {
              name: 'Product Not Found',
              image_url: '/placeholder.svg',
              type: 'product'
            }
          };
        });

        console.log('[OrderItemsList] Final items with products:', itemsWithProducts);
        setItems(itemsWithProducts);

      } catch (error) {
        console.error('[OrderItemsList] Unexpected error:', error);
        setItems([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOrderItems();

    return () => {
      cancelled = true;
    };
  }, [order.id, order.order_type]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-muted-foreground">Loading items...</span>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No items found for this order</p>
        <p className="text-xs text-muted-foreground mt-1">Order ID: {order.id}</p>
        <p className="text-xs text-muted-foreground">Order Type: {order.order_type}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item: any, idx: number) => {
        const product = item.product;
        const productImage = product?.image_url || '/placeholder.svg';
        const productName = product?.name || 'Unknown Product';
        const productType = product?.type || 'product';

        return (
          <div key={item.id || idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            {/* Product Image - 75x75px thumbnail */}
            <div className="relative w-[75px] h-[75px] flex-shrink-0">
              <img
                src={productImage}
                alt={productName}
                className="w-full h-full object-cover rounded-md border bg-white"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
            
            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-base mb-1 line-clamp-2">
                {productName}
              </h5>
              <div className="mb-2">
                <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  {productType}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Qty: {item.quantity} Unit: {Number(item.price).toLocaleString()} MMK
              </p>
            </div>
            
            {/* Total Price */}
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-lg text-primary">
                {(Number(item.price) * Number(item.quantity)).toLocaleString()} MMK
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
