import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types/admin';

interface OrderManagementProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: string) => void;
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders ({orders.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Details</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items/Route</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {order.order_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        #{order.id.slice(0, 8)}
                      </span>
                    </div>
                    {order.delivery_address && (
                      <p className="text-xs text-muted-foreground">
                        📍 {order.delivery_address}
                      </p>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    {order.order_type === 'car' ? (
                      <>
                        <p className="font-medium text-sm">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">
                          @{order.telegram_username}
                        </p>
                        {order.people_count && (
                          <p className="text-xs text-muted-foreground">
                            👥 {order.people_count} people
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        User: {order.user_id.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  {order.order_type === 'car' ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {order.from_location} → {order.to_location}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {order.location_type}
                      </Badge>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => (
                          <p key={idx} className="text-xs">
                            {item.quantity}x {item.product_name} (${item.price})
                          </p>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">No items</p>
                      )}
                    </div>
                  )}
                </TableCell>
                
                <TableCell>
                  <p className="font-medium">${order.total_amount}</p>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-xs">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                
                <TableCell>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {orders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};