import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Car, MapPin, Users, Clock, Phone, MessageCircle, Calculator, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CarOrderForm {
  name: string;
  telegram_username: string;
  from_location: string;
  to_location: string;
  location_type: string;
  people_count: number;
  additional_notes: string;
}

interface CarOrder {
  id: string;
  name: string;
  from_location: string;
  to_location: string;
  location_type: string;
  people_count: number;
  price: number;
  status: string;
  created_at: string;
  telegram_username: string;
}

const CarOrder = () => {
  const [form, setForm] = useState<CarOrderForm>({
    name: '',
    telegram_username: '',
    from_location: '',
    to_location: '',
    location_type: 'city',
    people_count: 1,
    additional_notes: ''
  });
  
  const [orders, setOrders] = useState<CarOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  useEffect(() => {
    calculatePrice();
  }, [form.location_type, form.people_count, form.from_location, form.to_location]);

  const fetchUserOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('car_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error loading orders",
        description: "Could not load your car orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!form.from_location || !form.to_location) {
      setEstimatedPrice(0);
      return;
    }

    let basePrice = 0;
    
    // Base price by location type
    switch (form.location_type) {
      case 'city':
        basePrice = 5000;
        break;
      case 'airport':
        basePrice = 15000;
        break;
      case 'intercity':
        basePrice = 25000;
        break;
      default:
        basePrice = 5000;
    }

    // Additional cost per person (after first person)
    const additionalPeopleCost = (form.people_count - 1) * 2000;
    
    // Distance factor (simple estimation based on location names)
    const distanceFactor = form.location_type === 'intercity' ? 2 : 1;
    
    const totalPrice = (basePrice + additionalPeopleCost) * distanceFactor;
    setEstimatedPrice(totalPrice);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to place a car order",
        variant: "destructive",
      });
      return;
    }

    if (!form.name || !form.telegram_username || !form.from_location || !form.to_location) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('car_orders')
        .insert({
          user_id: user.id,
          name: form.name,
          telegram_username: form.telegram_username,
          from_location: form.from_location,
          to_location: form.to_location,
          location_type: form.location_type,
          people_count: form.people_count,
          price: estimatedPrice,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Order placed successfully!",
        description: `Your car order has been submitted. Order ID: ${data.id.slice(0, 8)}`,
      });

      // Reset form
      setForm({
        name: '',
        telegram_username: '',
        from_location: '',
        to_location: '',
        location_type: 'city',
        people_count: 1,
        additional_notes: ''
      });

      // Refresh orders
      fetchUserOrders();
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Order failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
      case 'in_progress':
        return <Car className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Car Booking Service
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Safe, reliable, and comfortable transportation at your fingertips
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Book Your Ride
              </CardTitle>
              <CardDescription>
                Fill in the details below to book your car service
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="telegram">
                        <MessageCircle className="h-4 w-4 inline mr-1" />
                        Telegram Username *
                      </Label>
                      <Input
                        id="telegram"
                        placeholder="@username"
                        value={form.telegram_username}
                        onChange={(e) => setForm({ ...form, telegram_username: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Trip Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Trip Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        From *
                      </Label>
                      <Input
                        id="from"
                        placeholder="Pick-up location"
                        value={form.from_location}
                        onChange={(e) => setForm({ ...form, from_location: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="to">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        To *
                      </Label>
                      <Input
                        id="to"
                        placeholder="Drop-off location"
                        value={form.to_location}
                        onChange={(e) => setForm({ ...form, to_location: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location-type">Trip Type</Label>
                      <Select
                        value={form.location_type}
                        onValueChange={(value) => setForm({ ...form, location_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="city">City Trip</SelectItem>
                          <SelectItem value="airport">Airport Transfer</SelectItem>
                          <SelectItem value="intercity">Intercity Travel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="people">
                        <Users className="h-4 w-4 inline mr-1" />
                        Number of Passengers
                      </Label>
                      <Select
                        value={form.people_count.toString()}
                        onValueChange={(value) => setForm({ ...form, people_count: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? 'person' : 'people'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requests or additional information..."
                      value={form.additional_notes}
                      onChange={(e) => setForm({ ...form, additional_notes: e.target.value })}
                    />
                  </div>
                </div>

                <Separator />

                {/* Price Estimation */}
                {estimatedPrice > 0 && (
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Estimated Price</span>
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        {estimatedPrice.toLocaleString()} MMK
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Final price may vary based on actual distance and traffic conditions
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full btn-hero" 
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? 'Booking...' : 'Book Now'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Previous Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Your Recent Orders</CardTitle>
              <CardDescription>
                Track your car booking history and status
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <p className="text-sm text-muted-foreground">Your car bookings will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">{order.from_location} → {order.to_location}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span>
                            <Users className="h-4 w-4 inline mr-1" />
                            {order.people_count} people
                          </span>
                          <span className="capitalize">{order.location_type} trip</span>
                        </div>
                        <span className="font-semibold text-primary">
                          {order.price.toLocaleString()} MMK
                        </span>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                        Order ID: {order.id.slice(0, 8)} • Contact: {order.telegram_username}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Service Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Why Choose Our Car Service?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Professional Drivers</h3>
                <p className="text-sm text-muted-foreground">
                  Experienced and verified drivers for your safety and comfort
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">On-Time Service</h3>
                <p className="text-sm text-muted-foreground">
                  Punctual pickups and reliable scheduling you can count on
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">
                  Round-the-clock customer support via Telegram and phone
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CarOrder;