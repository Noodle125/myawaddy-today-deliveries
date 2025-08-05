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
    // Enhanced input validation
    const sanitizedType = codeType?.trim();
    if (!sanitizedType || sanitizedType.length === 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid code type.",
        variant: "destructive",
      });
      return;
    }
    
    if (codeCount < 1 || codeCount > 1000) {
      toast({
        title: "Invalid Input",
        description: "Code count must be between 1 and 1000.",
        variant: "destructive",
      });
      return;
    }

    try {
      const codes = [];
      for (let i = 0; i < codeCount; i++) {
        // Use cryptographically secure random generation
        const array = new Uint8Array(12);
        crypto.getRandomValues(array);
        const randomHex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        const code = `${sanitizedType.toUpperCase()}-${randomHex.substring(0, 8).toUpperCase()}`;
        codes.push({
          code,
          type: sanitizedType,
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
    // Enhanced input validation and sanitization
    const sanitizedName = name?.trim();
    const sanitizedType = type?.trim();
    
    if (!sanitizedName || sanitizedName.length === 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }
    
    if (!sanitizedType || sanitizedType.length === 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a category type.",
        variant: "destructive",
      });
      return;
    }
    
    if (sanitizedName.length > 100) {
      toast({
        title: "Invalid Input",
        description: "Category name must be less than 100 characters.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          name: sanitizedName,
          type: sanitizedType,
        });

      if (error) throw error;

      toast({
        title: "Category Created",
        description: `Category "${sanitizedName}" has been created successfully.`,
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
    // Enhanced input validation and sanitization
    const sanitizedData = {
      name: productData.name?.trim(),
      description: productData.description?.trim(),
      price: productData.price ? parseFloat(productData.price) : null,
      type: productData.type?.trim(),
      category_id: productData.category_id,
      image_url: productData.image_url?.trim()
    };

    if (!sanitizedData.name || sanitizedData.name.length === 0) {
      toast({
        title: "Invalid Input",
        description: "Product name is required.",
        variant: "destructive",
      });
      return;
    }
    
    if (!sanitizedData.type || sanitizedData.type.length === 0) {
      toast({
        title: "Invalid Input",
        description: "Product type is required.",
        variant: "destructive",
      });
      return;
    }
    
    if (!sanitizedData.price || isNaN(sanitizedData.price) || sanitizedData.price <= 0) {
      toast({
        title: "Invalid Input",
        description: "Valid product price is required.",
        variant: "destructive",
      });
      return;
    }
    
    if (!sanitizedData.category_id) {
      toast({
        title: "Invalid Input",
        description: "Product category is required.",
        variant: "destructive",
      });
      return;
    }
    
    if (sanitizedData.name.length > 200) {
      toast({
        title: "Invalid Input",
        description: "Product name must be less than 200 characters.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: sanitizedData.name,
          description: sanitizedData.description,
          price: sanitizedData.price,
          image_url: sanitizedData.image_url,
          category_id: sanitizedData.category_id,
          type: sanitizedData.type,
        });

      if (error) throw error;

      toast({
        title: "Product Created",
        description: `Product "${sanitizedData.name}" has been created successfully.`,
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