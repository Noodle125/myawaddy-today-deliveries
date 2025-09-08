import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Category } from '@/types/admin';
import { useAdminTypes } from '@/hooks/admin/useAdminTypes';

interface CategoryManagementProps {
  categories: Category[];
  onCreateCategory: (name: string, type: string) => void;
  onUpdateCategory: (id: string, name: string, type: string) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoryManagement = ({ 
  categories, 
  onCreateCategory, 
  onUpdateCategory, 
  onDeleteCategory 
}: CategoryManagementProps) => {
  const { types, fetchTypes } = useAdminTypes();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', type: '' });

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  useEffect(() => {
    if (types.length > 0 && !newCategoryType) {
      setNewCategoryType(types[0].name);
    }
  }, [types, newCategoryType]);

  const handleCreateCategory = () => {
    if (!newCategoryName.trim() || !newCategoryType) return;
    onCreateCategory(newCategoryName, newCategoryType);
    setNewCategoryName('');
  };

  const handleEditCategory = () => {
    if (!selectedCategory || !editFormData.name.trim() || !editFormData.type) return;
    onUpdateCategory(selectedCategory.id, editFormData.name, editFormData.type);
    setShowEditDialog(false);
    setSelectedCategory(null);
    setEditFormData({ name: '', type: '' });
  };

  const handleDeleteCategory = () => {
    if (!selectedCategory) return;
    onDeleteCategory(selectedCategory.id);
    setShowDeleteDialog(false);
    setSelectedCategory(null);
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setEditFormData({ name: category.name, type: category.type });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  };

  const activeTypes = types.filter(type => type.is_active);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Category
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                placeholder="e.g., Breakfast"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={newCategoryType} onValueChange={setNewCategoryType}>
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
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={handleCreateCategory} className="w-full">
                Create Category
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{category.name}</h3>
                  <Badge variant="outline" className="capitalize">{category.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Created {new Date(category.created_at).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(category)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                placeholder="e.g., Breakfast"
                value={editFormData.name}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
              />
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditCategory}>Update Category</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{selectedCategory?.name}" category? 
              This action cannot be undone and may affect existing products.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};