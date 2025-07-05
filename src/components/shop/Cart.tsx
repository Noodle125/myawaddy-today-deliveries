import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Minus, Plus, Trash2, CreditCard, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  type: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  total: number;
}

const Cart = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  total
}: CartProps) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to place an order",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checking out",
        variant: "destructive",
      });
      return;
    }

    if (!deliveryAddress.trim()) {
      toast({
        title: "Delivery address required",
        description: "Please enter your delivery address",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          order_type: 'shop',
          status: 'pending',
          delivery_address: deliveryAddress
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Order placed successfully!",
        description: `Order #${order.id.slice(0, 8)} has been placed. Total: ${total.toLocaleString()} MMK`,
      });

      onClearCart();
      setDeliveryAddress('');
      setSpecialInstructions('');
      setShowDeliveryForm(false);
      onClose();
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: error.message || "Something went wrong during checkout",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Shopping Cart
            {cart.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearCart}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Button onClick={onClose} variant="outline">
                  Continue Shopping
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {cart.map(item => (
                  <div key={item.product.id} className="flex gap-3 p-3 border border-border rounded-lg">
                    <img
                      src={item.product.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=80&h=80&fit=crop'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {item.product.description}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {item.product.type}
                      </Badge>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-primary">
                          {item.product.price.toLocaleString()} MMK
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRemoveItem(item.product.id)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Cart Summary */}
              <div className="py-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold text-primary">
                    {total.toLocaleString()} MMK
                  </span>
                </div>

                {!showDeliveryForm ? (
                  <Button
                    onClick={() => setShowDeliveryForm(true)}
                    className="w-full btn-hero"
                    size="lg"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceed to Checkout
                  </Button>
                ) : (
                  <div className="space-y-4">
                    {/* Delivery Information */}
                    <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                      <h3 className="font-semibold text-foreground flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Delivery Information
                      </h3>
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="delivery-address" className="text-sm font-medium">
                            Delivery Address *
                          </Label>
                          <Textarea
                            id="delivery-address"
                            placeholder="Enter your full delivery address..."
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="min-h-[60px] mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="special-instructions" className="text-sm font-medium">
                            Special Instructions
                          </Label>
                          <Textarea
                            id="special-instructions"
                            placeholder="Any special cooking instructions, allergies, or delivery notes..."
                            value={specialInstructions}
                            onChange={(e) => setSpecialInstructions(e.target.value)}
                            className="min-h-[60px] mt-1"
                          />
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Estimated delivery time: 30-45 minutes</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                        className="w-full btn-hero"
                        size="lg"
                      >
                        <CreditCard className="h-5 w-5 mr-2" />
                        {isCheckingOut ? 'Processing...' : 'Place Order'}
                      </Button>
                      
                      <Button
                        onClick={() => setShowDeliveryForm(false)}
                        variant="outline"
                        className="w-full"
                      >
                        Back to Cart
                      </Button>
                    </div>
                  </div>
                )}

                {!showDeliveryForm && (
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full"
                  >
                    Continue Shopping
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;