import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/types/admin';

export const useAdminActions = (orders: Order[], fetchDashboardData: () => void) => {
  const { toast } = useToast();

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Find the order to determine if it's a car order or regular order
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error('Order not found');

      const tableName = order.order_type === 'car' ? 'car_orders' : 'orders';
      
      const { error } = await supabase
        .from(tableName)
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order Updated",
        description: "Order status has been successfully updated.",
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  const generateCashbackCodes = async (codeType: string, codeCount: number) => {
    if (!codeType || codeCount < 1) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid code type and count.",
        variant: "destructive",
      });
      return;
    }

    try {
      const codes = [];
      for (let i = 0; i < codeCount; i++) {
        const code = `${codeType.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        codes.push({
          code,
          type: codeType,
        });
      }

      const { error } = await supabase
        .from('cashback_codes')
        .insert(codes);

      if (error) throw error;

      toast({
        title: "Codes Generated",
        description: `Successfully generated ${codeCount} cashback codes.`,
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error generating codes:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate cashback codes.",
        variant: "destructive",
      });
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Product Updated",
        description: "Product status has been successfully updated.",
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update product status.",
        variant: "destructive",
      });
    }
  };

  const createCategory = async (name: string, type: string) => {
    if (!name.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          name,
          type,
        });

      if (error) throw error;

      toast({
        title: "Category Created",
        description: `Category "${name}" has been created successfully.`,
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create category.",
        variant: "destructive",
      });
    }
  };

  const createProduct = async (productData: any) => {
    if (!productData.name.trim() || !productData.price || !productData.category_id) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          description: productData.description,
          price: parseFloat(productData.price),
          image_url: productData.image_url,
          category_id: productData.category_id,
          type: productData.type,
        });

      if (error) throw error;

      toast({
        title: "Product Created",
        description: `Product "${productData.name}" has been created successfully.`,
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create product.",
        variant: "destructive",
      });
    }
  };

  return {
    updateOrderStatus,
    generateCashbackCodes,
    toggleProductStatus,
    createCategory,
    createProduct
  };
};