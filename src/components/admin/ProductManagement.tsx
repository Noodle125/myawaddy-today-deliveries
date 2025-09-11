import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Product, Category } from '@/types/admin';
import { useAdminTypes } from '@/hooks/admin/useAdminTypes';

interface ProductManagementProps {
  products: Product[];
  categories: Category[];
  onCreateProduct: (product: any) => void;
  onUpdateProduct: (id: string, product: any) => void;
  onDeleteProduct: (id: string) => void;
  onToggleProductStatus: (productId: string, currentStatus: boolean) => void;
}

export const ProductManagement = ({ 
  products, 
  categories, 
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleProductStatus 
}: ProductManagementProps) => {
  const { types, fetchTypes } = useAdminTypes();
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
    type: ''
  });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
    type: ''
  });

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  useEffect(() => {
    if (types.length > 0 && !newProduct.type) {
      const firstActiveType = types.find(type => type.is_active);
      if (firstActiveType) {
        setNewProduct(prev => ({...prev, type: firstActiveType.name}));
      }
    }
  }, [types, newProduct.type]);

  const handleCreateProduct = () => {
    if (!newProduct.name.trim() || !newProduct.type || !newProduct.category_id || !newProduct.price) return;
    onCreateProduct(newProduct);
    
    // Reset form with first active type
    const firstActiveType = activeTypes[0];
    setNewProduct({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category_id: '',
      type: firstActiveType ? firstActiveType.name : ''
    });
  };

  const handleEditProduct = () => {
    if (!selectedProduct || !editFormData.name.trim()) return;
    onUpdateProduct(selectedProduct.id, editFormData);
    setShowEditDialog(false);
    setSelectedProduct(null);
    setEditFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category_id: '',
      type: ''
    });
  };

  const handleDeleteProduct = async () => {
    if (selectedProduct) {
      // Show confirmation with product details
      const confirmed = window.confirm(
        `Are you sure you want to delete "${selectedProduct.name}"? This action cannot be undone. If this product has been ordered before, the order history will be preserved.`
      );
      
      if (!confirmed) {
        setShowDeleteDialog(false);
        return;
      }
      
      onDeleteProduct(selectedProduct.id);
      setSelectedProduct(null);
      setShowDeleteDialog(false);
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setEditFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      image_url: product.image_url || '',
      category_id: product.category_id || '',
      type: product.type
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const activeTypes = types.filter(type => type.is_active);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Product
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                placeholder="e.g., Black Coffee"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={newProduct.category_id} 
                onValueChange={(value) => setNewProduct({...newProduct, category_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select 
                value={newProduct.type} 
                onValueChange={(value) => setNewProduct({...newProduct, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {types.filter(type => type.is_active).map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Product description..."
              value={newProduct.description}
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input
              placeholder="https://example.com/image.jpg"
              value={newProduct.image_url}
              onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
            />
          </div>
          <Button onClick={handleCreateProduct} className="w-full">
            Create Product
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.type}</p>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">${product.price}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(product)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={product.is_active ? "default" : "secondary"}
                    size="sm"
                    onClick={() => onToggleProductStatus(product.id, product.is_active)}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input
                  placeholder="e.g., Black Coffee"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={editFormData.category_id} 
                  onValueChange={(value) => setEditFormData({...editFormData, category_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({category.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={editFormData.type} 
                  onValueChange={(value) => setEditFormData({...editFormData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Product description..."
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={editFormData.image_url}
                onChange={(e) => setEditFormData({...editFormData, image_url: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditProduct}>Update Product</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};