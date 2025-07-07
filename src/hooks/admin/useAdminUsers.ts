import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/admin';

export const useAdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      console.log('Fetching all users...');
      
      // Get all profiles first (this is our primary source of users)
      const profilesResult = await supabase
        .from('profiles')
        .select(`
          user_id,
          display_name,
          phone_number,
          telegram_username,
          profile_picture_url,
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (profilesResult.error) throw profilesResult.error;

      console.log('Profiles fetched:', profilesResult.data?.length);

      // Get all users data
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
        .order('created_at', { ascending: false });
      
      if (usersResult.error) throw usersResult.error;

      console.log('Users fetched:', usersResult.data?.length);

      // Create a comprehensive user list combining both sources
      const profileUserIds = new Set(profilesResult.data?.map(p => p.user_id) || []);
      const usersData = usersResult.data || [];
      
      // Start with users who have profiles
      const combinedUsers = (profilesResult.data || []).map(profile => {
        const user = usersData.find(u => u.id === profile.user_id);
        return {
          id: profile.user_id,
          username: user?.username,
          created_at: profile.created_at || user?.created_at,
          display_name: user?.display_name,
          bio: user?.bio,
          avatar_url: user?.avatar_url,
          age: user?.age,
          gender: user?.gender,
          relationship_status: user?.relationship_status,
          profile_display_name: profile.display_name,
          phone_number: profile.phone_number,
          telegram_username: profile.telegram_username,
          profile_picture_url: profile.profile_picture_url
        };
      });

      // Add users who don't have profiles yet
      const usersWithoutProfiles = usersData.filter(user => !profileUserIds.has(user.id));
      usersWithoutProfiles.forEach(user => {
        combinedUsers.push({
          ...user,
          profile_display_name: null,
          phone_number: null,
          telegram_username: null,
          profile_picture_url: null
        });
      });

      console.log('Combined users result:', combinedUsers.length);
      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }
  }, []);

  return { users, fetchUsers };
};