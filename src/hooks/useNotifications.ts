import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { playNotificationSound } from '@/utils/notificationSound';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'order' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  updated_at: string;
  metadata: any;
}

export const useNotifications = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications with retry logic
  const fetchNotifications = async (retries = 3) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching notifications for user:', user.id);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (data) {
        console.log('Notifications fetched successfully:', data.length);
        const typedNotifications = data.map(notification => ({
          ...notification,
          type: notification.type as 'info' | 'order' | 'success' | 'warning' | 'error'
        }));
        setNotifications(typedNotifications);
        setUnreadCount(typedNotifications.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications (attempt', 4 - retries, '):', error);
      
      if (retries > 0) {
        console.log('Retrying in 2 seconds...');
        setTimeout(() => fetchNotifications(retries - 1), 2000);
        return;
      }
      
      // If all retries failed, set empty state but don't show error to user
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      console.log('Marking notification as read:', notificationId);
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Database error:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      console.log('Notification marked as read successfully');
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      console.log('Marking all notifications as read for user:', user.id);
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Database error:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      console.log('All notifications marked as read successfully');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    console.log('Setting up notification subscription for user:', user.id);
    
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time notification payload received:', payload);
          const newNotification = payload.new as Notification;
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Play sound and show toast for order notifications
          console.log('Processing new notification:', newNotification);
          
          if (newNotification.type === 'order') {
            console.log('Order notification detected, playing sound and showing toast');
            
            // Play notification sound
            try {
              playNotificationSound();
              console.log('Notification sound played successfully');
            } catch (soundError) {
              console.error('Error playing notification sound:', soundError);
            }
            
            const orderData = newNotification.metadata || {};
            const orderDetails = orderData.car_order_id 
              ? `Car Order: ${orderData.from_location} → ${orderData.to_location}\nCustomer: ${orderData.customer_name}\nContact: @${orderData.telegram_username}\nAmount: ${orderData.price?.toLocaleString()} MMK`
              : `${orderData.order_type} Order\nAmount: ${orderData.total_amount?.toLocaleString()} MMK`;

            toast({
              title: newNotification.title,
              description: orderDetails,
              duration: 8000,
            });
            console.log('Order notification toast displayed');
          } else {
            toast({
              title: newNotification.title,
              description: newNotification.message,
              duration: 5000,
            });
            console.log('General notification toast displayed');
          }
        }
      )
      .subscribe((status) => {
        console.log('Notification subscription status:', status);
      });

    return () => {
      console.log('Cleaning up notification subscription');
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};