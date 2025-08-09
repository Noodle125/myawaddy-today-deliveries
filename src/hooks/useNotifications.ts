import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { playNotificationSound, playNotificationPreset, playNotificationSoundFromFile, NotificationSoundSetting } from '@/utils/notificationSound';

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
  const [soundSetting, setSoundSetting] = useState<NotificationSoundSetting | null>(null);

  // Load admin sound setting
  const loadSoundSetting = async () => {
    if (!isAdmin) return;
    
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'notification_sound')
        .maybeSingle();

      if (error) {
        console.error('Error loading sound setting:', error);
        return;
      }

      if (data?.value) {
        setSoundSetting(data.value as NotificationSoundSetting);
      }
    } catch (error) {
      console.error('Error loading sound setting:', error);
    }
  };

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
    
    // Load sound setting for admin users
    if (isAdmin) {
      loadSoundSetting();
    }

    console.log('Setting up notification subscription for user:', user.id, 'isAdmin:', isAdmin);
    
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
            
            // Play admin's chosen sound
            const playSound = async () => {
              try {
                // Check if user has interacted with the page (required for autoplay)
                if (document.visibilityState === 'visible') {
                  if (soundSetting) {
                    if (soundSetting.mode === 'file') {
                      await playNotificationSoundFromFile(soundSetting.src);
                    } else {
                      await playNotificationPreset(soundSetting.preset);
                    }
                  } else {
                    // Fallback to default sound
                    playNotificationSound();
                  }
                  console.log('Notification sound played successfully');
                } else {
                  console.log('Page not visible, skipping sound');
                }
              } catch (soundError) {
                console.error('Error playing notification sound:', soundError);
                // Try alternative notification methods
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification(newNotification.title, {
                    body: newNotification.message,
                    icon: '/favicon.ico'
                  });
                }
              }
            };

            playSound();
            
            const orderData = newNotification.metadata || {};
            
            // Handle car orders (existing functionality)
            if (orderData.car_order_id) {
              const orderDetails = `Car Order: ${orderData.from_location} → ${orderData.to_location}\nCustomer: ${orderData.customer_name}\nContact: @${orderData.telegram_username}\nAmount: ${orderData.price?.toLocaleString()} MMK`;
              
              toast({
                title: newNotification.title,
                description: orderDetails,
                duration: 8000,
              });
            } else {
              // Handle shop/food orders with product details
              const items = orderData.items || [];
              const itemCount = orderData.item_count || 0;
              
              let orderDetails = `${orderData.order_type} Order #${orderData.order_id?.substring(0, 8)}\n`;
              orderDetails += `Items: ${itemCount} | Total: ${orderData.total_amount?.toLocaleString()} MMK\n`;
              
              // Add first few items for preview
              if (items.length > 0) {
                const previewItems = items.slice(0, 2);
                previewItems.forEach((item: any) => {
                  orderDetails += `• ${item.product_name} x${item.quantity} - ${item.price?.toLocaleString()} MMK\n`;
                });
                
                if (items.length > 2) {
                  orderDetails += `... and ${items.length - 2} more items`;
                }
              }
              
              toast({
                title: newNotification.title,
                description: orderDetails.trim(),
                duration: 8000,
              });
            }
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
      );

    // Listen for sound setting changes (admin only)
    if (isAdmin) {
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'app_settings',
          filter: `key=eq.notification_sound`
        },
        (payload) => {
          console.log('Sound setting updated:', payload);
          const newValue = payload.new?.value as NotificationSoundSetting;
          if (newValue) {
            setSoundSetting(newValue);
            console.log('Updated sound setting in real-time');
          }
        }
      );
    }

    channel.subscribe((status) => {
      console.log('Notification subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to notifications');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Error with notification subscription channel');
      }
    });

    // Request browser notification permissions for admin users
    if (isAdmin && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }

    return () => {
      console.log('Cleaning up notification subscription');
      supabase.removeChannel(channel);
    };
  }, [user, toast, isAdmin, soundSetting]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};