import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  type: string;
  is_active: boolean;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface ProductManagementProps {
  products: Product[];
  categories: Category[];
  onCreateProduct: (product: any) => void;
  onToggleProductStatus: (productId: string, currentStatus: boolean) => void;
}

export const ProductManagement = ({ 
  products, 
  categories, 
  onCreateProduct, 
  onToggleProductStatus 
}: ProductManagementProps) => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
    type: 'food'
  });

  const handleCreateProduct = () => {
    onCreateProduct(newProduct);
    setNewProduct({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category_id: '',
      type: 'food'
    });
  };

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
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="beverage">Beverage</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
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
    </div>
  );
};