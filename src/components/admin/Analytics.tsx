import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Order {
  id: string;
  order_type: string;
  status: string;
  total_amount: number;
  created_at: string;
  user_id: string;
}

interface AnalyticsProps {
  orders: Order[];
}

export const Analytics = ({ orders }: AnalyticsProps) => {
  return (
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
  );
};