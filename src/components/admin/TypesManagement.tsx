import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { CategoryType } from '@/types/admin';

interface TypesManagementProps {
  types: CategoryType[];
  onCreateType: (name: string, description?: string) => Promise<void>;
  onUpdateType: (id: string, name: string, description?: string) => Promise<void>;
  onToggleTypeStatus: (id: string, currentStatus: boolean) => Promise<void>;
  onDeleteType: (id: string) => Promise<void>;
}

export const TypesManagement = ({ 
  types, 
  onCreateType, 
  onUpdateType, 
  onToggleTypeStatus, 
  onDeleteType 
}: TypesManagementProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<CategoryType | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });


  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    try {
      await onCreateType(formData.name, formData.description);
      setFormData({ name: '', description: '' });
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating type:', error);
    }
  };

  const handleEdit = async () => {
    if (!selectedType || !formData.name.trim()) return;
    try {
      await onUpdateType(selectedType.id, formData.name, formData.description);
      setShowEditDialog(false);
      setSelectedType(null);
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Error updating type:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedType) return;
    try {
      await onDeleteType(selectedType.id);
      setShowDeleteDialog(false);
      setSelectedType(null);
    } catch (error) {
      console.error('Error deleting type:', error);
    }
  };

  const openEditDialog = (type: CategoryType) => {
    setSelectedType(type);
    setFormData({ name: type.name, description: type.description || '' });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (type: CategoryType) => {
    setSelectedType(type);
    setShowDeleteDialog(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Category Types Management</CardTitle>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {types.map((type) => (
              <div key={type.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium capitalize">{type.name}</h3>
                  <Badge variant={type.is_active ? "default" : "secondary"}>
                    {type.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {type.description && (
                  <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleTypeStatus(type.id, type.is_active)}
                  >
                    {type.is_active ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(type)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(type)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type Name</Label>
              <Input
                placeholder="e.g., electronics"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Brief description of this type..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Type</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type Name</Label>
              <Input
                placeholder="e.g., electronics"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Brief description of this type..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>Update Type</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{selectedType?.name}" category type? 
              This action cannot be undone and may affect existing categories and products.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};