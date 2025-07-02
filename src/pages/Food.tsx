import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, ShoppingCart, MapPin, Clock, Star, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Cart from '@/components/shop/Cart';

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  type: string;
  category_id?: string;
}

interface CartItem {
  product: FoodItem;
  quantity: number;
}

const Food = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('type', 'food')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setFoodItems(data || []);
    } catch (error) {
      console.error('Error fetching food items:', error);
      toast({
        title: "Error loading menu",
        description: "Could not load food items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (foodItem: FoodItem) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === foodItem.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === foodItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product: foodItem, quantity: 1 }];
    });

    toast({
      title: "Added to cart",
      description: `${foodItem.name} has been added to your cart`,
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(foodItems.map(item => item.type))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading delicious food...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Delicious Food Delivery
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Fresh ingredients, authentic flavors, delivered right to your door
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Delivery Info */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="delivery-address" className="text-base font-medium mb-2 block">
                <MapPin className="h-4 w-4 inline mr-2" />
                Delivery Address
              </Label>
              <Textarea
                id="delivery-address"
                placeholder="Enter your full delivery address..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <div>
              <Label htmlFor="special-instructions" className="text-base font-medium mb-2 block">
                Special Instructions
              </Label>
              <Textarea
                id="special-instructions"
                placeholder="Any special cooking instructions, allergies, or delivery notes..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
          
          <div className="mt-4 flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>Estimated delivery time: 30-45 minutes</span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category === 'all' ? 'All Items' : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Cart Summary (Mobile) */}
        {cart.length > 0 && (
          <div className="md:hidden bg-primary text-primary-foreground p-4 rounded-lg mb-6 flex items-center justify-between">
            <div>
              <span className="font-semibold">{totalItems} items</span>
              <span className="ml-2">{totalAmount.toLocaleString()} MMK</span>
            </div>
            <Button 
              onClick={() => setIsCartOpen(true)}
              variant="secondary"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Cart
            </Button>
          </div>
        )}

        {/* Food Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">No food items found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or category filter</p>
            </div>
          ) : (
            filteredItems.map(item => (
              <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="p-0">
                  <div className="aspect-[4/3] bg-muted rounded-t-lg overflow-hidden">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </CardHeader>
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                    <div className="flex items-center ml-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm ml-1">4.5</span>
                    </div>
                  </div>
                  
                  <CardDescription className="line-clamp-2 mb-3">
                    {item.description || 'Delicious and freshly prepared dish'}
                  </CardDescription>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                      {item.price.toLocaleString()} MMK
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0">
                  {cart.find(cartItem => cartItem.product.id === item.id) ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const cartItem = cart.find(ci => ci.product.id === item.id);
                            if (cartItem) {
                              updateQuantity(item.id, cartItem.quantity - 1);
                            }
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="font-medium w-8 text-center">
                          {cart.find(cartItem => cartItem.product.id === item.id)?.quantity}
                        </span>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const cartItem = cart.find(ci => ci.product.id === item.id);
                            if (cartItem) {
                              updateQuantity(item.id, cartItem.quantity + 1);
                            }
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => addToCart(item)}
                      className="w-full btn-hero"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* Floating Cart Button (Desktop) */}
        {cart.length > 0 && (
          <div className="hidden md:block fixed bottom-6 right-6 z-40">
            <Button 
              onClick={() => setIsCartOpen(true)}
              className="btn-hero shadow-xl h-14 px-6"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {totalItems} items • {totalAmount.toLocaleString()} MMK
            </Button>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        total={totalAmount}
      />
    </div>
  );
};

export default Food;