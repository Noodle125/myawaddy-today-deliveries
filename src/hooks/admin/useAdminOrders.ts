import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/admin';

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = useCallback(async () => {
    try {
      // Fetch recent orders with more details - sequential to avoid overwhelming connection
      const ordersResult = await supabase
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
        .limit(10);
      
      if (ordersResult.error) throw ordersResult.error;

      const carOrdersResult = await supabase
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
        .limit(10);
      
      if (carOrdersResult.error) throw carOrdersResult.error;

      // Get order IDs to filter order items
      const orderIds = (ordersResult.data || []).map(order => order.id);
      
      const orderItemsResult = await supabase
        .from('order_items')
        .select(`
          order_id,
          quantity,
          price,
          products (
            name,
            type,
            image_url
          )
        `)
        .in('order_id', orderIds);
      
      if (orderItemsResult.error) throw orderItemsResult.error;

      console.log('Order items raw data:', orderItemsResult.data);

      // Combine regular orders and car orders with enhanced data
      const regularOrdersWithItems = (ordersResult.data || []).map(order => {
        const items = (orderItemsResult.data || []).filter(item => item.order_id === order.id);
        console.log(`Order ${order.id} items:`, items);
        
        return {
          ...order,
          items: items.map(item => {
            // Handle the nested products structure correctly
            const product = Array.isArray(item.products) ? item.products[0] : item.products;
            return {
              quantity: item.quantity,
              price: item.price,
              product_name: product?.name || 'Unknown Product',
              product_type: product?.type || 'Unknown Type',
              product_image: product?.image_url || null
            };
          })
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
    } catch (error) {
      console.error('Error fetching admin orders:', error);
    }
  }, []);

  return { orders, fetchOrders };
};