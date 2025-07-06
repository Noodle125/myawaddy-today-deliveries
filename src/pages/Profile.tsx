import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, ShoppingBag, Car, Save } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  phone_number: string;
  telegram_username: string;
  profile_picture_url: string | null;
}

interface UserInfo {
  id: string;
  username: string;
  age: number | null;
  gender: string | null;
  relationship_status: string | null;
  bio: string | null;
  avatar_url: string | null;
}

interface Order {
  id: string;
  order_type: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      image_url: string | null;
      type: string;
    };
  }[];
}

interface CarOrder {
  id: string;
  from_location: string;
  to_location: string;
  status: string;
  price: number;
  created_at: string;
  name: string;
  people_count: number;
  location_type: string;
  telegram_username: string;
}

const Profile = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [carOrders, setCarOrders] = useState<CarOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      console.log('Profile fetch result:', { profileData, profileError });
      
      if (profileData) {
        setProfile(profileData);
      } else {
        // Initialize empty profile if none exists
        setProfile({
          id: '',
          user_id: user?.id || '',
          display_name: '',
          phone_number: '',
          telegram_username: '',
          profile_picture_url: null,
        });
      }

      // Fetch user info
      const { data: userInfoData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      console.log('User fetch result:', { userInfoData, userError });

      if (userInfoData) {
        setUserInfo(userInfoData);
      } else {
        // Initialize empty user info if none exists
        setUserInfo({
          id: user?.id || '',
          username: '',
          age: null,
          gender: null,
          relationship_status: null,
          bio: null,
          avatar_url: null,
        });
      }

      // Fetch orders with product details
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          id, 
          order_type, 
          status, 
          total_amount, 
          created_at,
          order_items (
            id,
            quantity,
            price,
            product:products (
              id,
              name,
              image_url,
              type
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersData) {
        setOrders(ordersData);
      }

      // Fetch car orders
      const { data: carOrdersData } = await supabase
        .from('car_orders')
        .select('id, from_location, to_location, status, price, created_at, name, people_count, location_type, telegram_username')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (carOrdersData) {
        setCarOrders(carOrdersData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!profile || !userInfo) {
      console.log('Cannot save - missing data:', { profile, userInfo });
      return;
    }

    console.log('Attempting to save profile:', { profile, userInfo });
    setSaving(true);
    try {
      // Update or insert profile
      const { data: profileResult, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          display_name: profile.display_name,
          phone_number: profile.phone_number,
          telegram_username: profile.telegram_username,
        })
        .select();

      console.log('Profile upsert result:', { profileResult, profileError });
      if (profileError) throw profileError;

      // Update or insert user info
      const { data: userResult, error: userError } = await supabase
        .from('users')
        .upsert({
          id: user?.id,
          username: userInfo.username,
          age: userInfo.age,
          gender: userInfo.gender,
          relationship_status: userInfo.relationship_status,
          bio: userInfo.bio,
        })
        .select();

      console.log('User upsert result:', { userResult, userError });
      if (userError) throw userError;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Refresh data to show updated information
      fetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
              <p className="text-sm text-muted-foreground">Manage your account settings and preferences</p>
            </div>
            {isAdmin && (
              <Badge variant="secondary" className="ml-2">
                Admin
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="car-orders" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Car Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={profile?.display_name || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, display_name: e.target.value} : {
                      id: '',
                      user_id: user?.id || '',
                      display_name: e.target.value,
                      phone_number: '',
                      telegram_username: '',
                      profile_picture_url: null,
                    })}
                  />
                </div>
                 <div className="space-y-2">
                   <Label htmlFor="username">Username</Label>
                   <Input
                     id="username"
                     value={userInfo?.username || ''}
                     onChange={(e) => setUserInfo(prev => prev ? {...prev, username: e.target.value} : {
                       id: user?.id || '',
                       username: e.target.value,
                       age: null,
                       gender: null,
                       relationship_status: null,
                       bio: null,
                       avatar_url: null,
                     })}
                     placeholder="Enter your username"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="phone">Phone Number</Label>
                   <Input
                     id="phone"
                     value={profile?.phone_number || ''}
                     onChange={(e) => setProfile(prev => prev ? {...prev, phone_number: e.target.value} : {
                       id: '',
                       user_id: user?.id || '',
                       display_name: '',
                       phone_number: e.target.value,
                       telegram_username: '',
                       profile_picture_url: null,
                     })}
                     placeholder="Enter your phone number"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="telegram">Telegram Username</Label>
                   <Input
                     id="telegram"
                     value={profile?.telegram_username || ''}
                     onChange={(e) => setProfile(prev => prev ? {...prev, telegram_username: e.target.value} : {
                       id: '',
                       user_id: user?.id || '',
                       display_name: '',
                       phone_number: '',
                       telegram_username: e.target.value,
                       profile_picture_url: null,
                     })}
                     placeholder="@username"
                   />
                 </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={userInfo?.age?.toString() || ''}
                      onChange={(e) => setUserInfo(prev => prev ? {...prev, age: e.target.value ? parseInt(e.target.value) : null} : {
                        id: user?.id || '',
                        username: '',
                        age: e.target.value ? parseInt(e.target.value) : null,
                        gender: null,
                        relationship_status: null,
                        bio: null,
                        avatar_url: null,
                      })}
                      placeholder="Enter your age"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      value={userInfo?.gender || ''}
                      onChange={(e) => setUserInfo(prev => prev ? {...prev, gender: e.target.value} : {
                        id: user?.id || '',
                        username: '',
                        age: null,
                        gender: e.target.value,
                        relationship_status: null,
                        bio: null,
                        avatar_url: null,
                      })}
                      placeholder="Enter your gender"
                    />
                  </div>
               </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={userInfo?.bio || ''}
                    onChange={(e) => setUserInfo(prev => prev ? {...prev, bio: e.target.value} : {
                      id: user?.id || '',
                      username: '',
                      age: null,
                      gender: null,
                      relationship_status: null,
                      bio: e.target.value,
                      avatar_url: null,
                    })}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="md:col-span-2 pt-4 border-t">
                  <Button onClick={updateProfile} disabled={saving} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Order History</CardTitle>
              </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No orders found.</p>
              ) : (
                 <div className="space-y-4">
                   {orders.map((order) => (
                     <div key={order.id} className="border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                       <div className="flex items-center justify-between p-4 border-b border-border">
                         <div>
                           <p className="font-medium text-foreground capitalize">{order.order_type} Order</p>
                           <p className="text-sm text-muted-foreground">
                             {new Date(order.created_at).toLocaleDateString()}
                           </p>
                         </div>
                         <div className="text-right">
                           <p className="font-medium text-foreground">{order.total_amount.toLocaleString()} MMK</p>
                           <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                             {order.status}
                           </Badge>
                         </div>
                       </div>
                       
                       {/* Product Details */}
                       <div className="p-4">
                         <h4 className="font-medium text-sm text-muted-foreground mb-3">Items Ordered:</h4>
                         <div className="space-y-3">
                           {order.order_items?.map((item) => (
                             <div key={item.id} className="flex items-center gap-3">
                               <img
                                 src={item.product.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=50&h=50&fit=crop'}
                                 alt={item.product.name}
                                 className="w-12 h-12 object-cover rounded-md"
                               />
                               <div className="flex-1">
                                 <p className="font-medium text-sm">{item.product.name}</p>
                                 <p className="text-xs text-muted-foreground">
                                   <Badge variant="outline" className="text-xs mr-2">
                                     {item.product.type}
                                   </Badge>
                                   Qty: {item.quantity} × {item.price.toLocaleString()} MMK
                                 </p>
                               </div>
                               <div className="text-right">
                                 <p className="font-medium text-sm">{(item.price * item.quantity).toLocaleString()} MMK</p>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

          <TabsContent value="car-orders" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Car Order History</CardTitle>
              </CardHeader>
            <CardContent>
              {carOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No car orders found.</p>
              ) : (
                <div className="space-y-4">
                  {carOrders.map((carOrder) => (
                     <div key={carOrder.id} className="p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                       <div className="flex items-start justify-between mb-3">
                         <div className="flex-1">
                           <p className="font-medium text-foreground mb-1">{carOrder.from_location} → {carOrder.to_location}</p>
                           <p className="text-sm text-muted-foreground mb-2">
                             {new Date(carOrder.created_at).toLocaleDateString()}
                           </p>
                           <div className="space-y-1">
                             <p className="text-sm text-muted-foreground">
                               <span className="font-medium">Customer:</span> {carOrder.name}
                             </p>
                             <p className="text-sm text-muted-foreground">
                               <span className="font-medium">People:</span> {carOrder.people_count}
                             </p>
                             <p className="text-sm text-muted-foreground">
                               <span className="font-medium">Type:</span> {carOrder.location_type}
                             </p>
                             <p className="text-sm text-muted-foreground">
                               <span className="font-medium">Contact:</span> {carOrder.telegram_username}
                             </p>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="font-medium text-foreground text-lg">{carOrder.price.toLocaleString()} MMK</p>
                           <Badge variant={carOrder.status === 'completed' ? 'default' : 'secondary'}>
                             {carOrder.status}
                           </Badge>
                         </div>
                       </div>
                     </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;