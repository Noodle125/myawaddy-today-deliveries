import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Order {
  id: string;
  order_type: string;
  status: string;
  total_amount: number;
  created_at: string;
  user_id: string;
}

interface OrderManagementProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: string) => void;
}

export const OrderManagement = ({ orders, onUpdateOrderStatus }: OrderManagementProps) => {
  return (
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};