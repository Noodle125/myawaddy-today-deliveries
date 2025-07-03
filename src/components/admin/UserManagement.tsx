import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  username: string;
  created_at: string;
}

interface UserManagementProps {
  users: User[];
}

export const UserManagement = ({ users }: UserManagementProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-muted-foreground">User ID: {user.id.slice(0, 8)}...</p>
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">user</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};