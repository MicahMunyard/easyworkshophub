
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { DEFAULT_CATEGORIES, ProductCategory, getCategoryById } from './config/productCategories';
import { useUserCategories } from '@/hooks/inventory/useUserCategories';

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  className
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const { userCategories, addUserCategory } = useUserCategories();

  const allCategories = [...DEFAULT_CATEGORIES, ...userCategories];
  const selectedCategory = allCategories.find(cat => cat.id === value) || getCategoryById(value);

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      const newCategory = await addUserCategory(newCategoryName.trim());
      if (newCategory) {
        onChange(newCategory.id);
        setNewCategoryName('');
        setIsAddingCategory(false);
      }
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category">
                {selectedCategory && (
                  <div className="flex items-center gap-2">
                    <selectedCategory.icon 
                      className="h-4 w-4" 
                      style={{ color: selectedCategory.color }} 
                    />
                    <span>{selectedCategory.name}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_CATEGORIES.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <category.icon 
                      className="h-4 w-4" 
                      style={{ color: category.color }} 
                    />
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
              {userCategories.length > 0 && (
                <>
                  <div className="border-t my-1" />
                  {userCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <category.icon 
                          className="h-4 w-4" 
                          style={{ color: category.color }} 
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsAddingCategory(true)}
          title="Add custom category"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                placeholder="Enter category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
                Add Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategorySelector;
