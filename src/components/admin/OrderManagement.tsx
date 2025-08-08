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
                    <OrderItemsList order={order} />
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
  const [items, setItems] = useState(order.items ?? []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (order.order_type === 'car') return;
      if (items && items.length > 0) return;
      const { data } = await supabase
        .from('order_items')
        .select(`quantity, price, products(name,type,image_url)`) 
        .eq('order_id', order.id);
      if (!cancelled && data) {
        const mapped = (data as any[]).map((it: any) => {
          const product = Array.isArray(it.products) ? it.products[0] : it.products;
          return {
            quantity: it.quantity,
            price: it.price,
            product_name: product?.name || 'Unknown Product',
            product_type: product?.type || undefined,
            product_image: product?.image_url || null,
          };
        });
        setItems(mapped);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [order.id]);

  if (!items || items.length === 0) {
    return <p className="text-xs text-muted-foreground">No items found</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item: any, idx: number) => (
        <div key={idx} className="flex items-center gap-3">
          <img
            src={item.product_image || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=50&h=50&fit=crop'}
            alt={item.product_name || 'Product'}
            className="w-12 h-12 object-cover rounded-md"
            loading="lazy"
          />
          <div className="flex-1">
            <p className="font-medium text-sm">{item.product_name}</p>
            <p className="text-xs text-muted-foreground">
              {item.product_type && (
                <Badge variant="outline" className="text-xs mr-2">
                  {item.product_type}
                </Badge>
              )}
              Qty: {item.quantity} × {Number(item.price).toLocaleString()} MMK
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium text-sm">
              {(Number(item.price) * Number(item.quantity)).toLocaleString()} MMK
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
