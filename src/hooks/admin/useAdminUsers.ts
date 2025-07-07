import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/admin';

export const useAdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      // Fetch recent users with profile information
      const usersResult = await supabase
        .from('users')
        .select(`
          id,
          username,
          created_at,
          display_name,
          bio,
          avatar_url,
          age,
          gender,
          relationship_status
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (usersResult.error) throw usersResult.error;

      // Fetch profiles for additional user info
      const profilesResult = await supabase
        .from('profiles')
        .select(`
          user_id,
          display_name,
          phone_number,
          telegram_username,
          profile_picture_url
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (profilesResult.error) throw profilesResult.error;

      // Combine users with profile data
      if (usersResult.data && profilesResult.data) {
        const combinedUsers = usersResult.data.map(user => {
          const profile = profilesResult.data.find(p => p.user_id === user.id);
          return {
            ...user,
            profile_display_name: profile?.display_name,
            phone_number: profile?.phone_number,
            telegram_username: profile?.telegram_username,
            profile_picture_url: profile?.profile_picture_url
          };
        });
        setUsers(combinedUsers);
      } else if (usersResult.data) {
        setUsers(usersResult.data);
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }
  }, []);

  return { users, fetchUsers };
};