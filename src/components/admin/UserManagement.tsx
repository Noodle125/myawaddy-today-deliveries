import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types/admin';

interface UserManagementProps {
  users: User[];
}

export const UserManagement = ({ users }: UserManagementProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Users ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profile_picture_url} />
                      <AvatarFallback>
                        {user.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {user.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    {user.phone_number && (
                      <p className="text-sm">📞 {user.phone_number}</p>
                    )}
                    {user.telegram_username && (
                      <p className="text-sm">💬 @{user.telegram_username}</p>
                    )}
                    {!user.phone_number && !user.telegram_username && (
                      <p className="text-xs text-muted-foreground">No contact info</p>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    {(user.display_name || user.profile_display_name) && (
                      <p className="text-sm font-medium">
                        {user.display_name || user.profile_display_name}
                      </p>
                    )}
                    {user.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {user.bio}
                      </p>
                    )}
                    {!user.display_name && !user.profile_display_name && !user.bio && (
                      <p className="text-xs text-muted-foreground">No profile info</p>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge variant="outline">active</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {users.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};