
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InventoryItem, Supplier } from '@/types/inventory';
import { Barcode, FileText, ShoppingBag, DollarSign, MapPin, Hash, ImageIcon, Tag, Trash2 } from 'lucide-react';
import CategorySelector from './CategorySelector';

const formSchema = z.object({
  code: z.string().min(1, { message: 'Product code is required' }),
  name: z.string().min(1, { message: 'Product name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  brand: z.string().optional(),
  supplierId: z.string().min(1, { message: 'Supplier is required' }),
  inStock: z.coerce.number().min(0, { message: 'Stock cannot be negative' }),
  minStock: z.coerce.number().min(0, { message: 'Minimum stock cannot be negative' }),
  price: z.coerce.number().min(0, { message: 'Price cannot be negative' }),
  retailPrice: z.coerce.number().min(0).optional(),
  location: z.string().optional(),
  imageUrl: z.string().optional(),
});

type ProductFormProps = {
  item?: InventoryItem;
  suppliers: Supplier[];
  onSubmit: (data: z.infer<typeof formSchema> & { supplier: string }) => void;
  onCancel: () => void;
  onDelete?: (id: string, name: string) => void;
};

const ProductForm: React.FC<ProductFormProps> = ({ item, suppliers, onSubmit, onCancel, onDelete }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(item?.imageUrl || null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: item?.code || '',
      name: item?.name || '',
      description: item?.description || '',
      category: item?.category || '',
      brand: item?.brand || '',
      supplierId: item?.supplierId || '',
      inStock: item?.inStock || 0,
      minStock: item?.minStock || 0,
      price: item?.price || 0,
      retailPrice: item?.retailPrice || 0,
      location: item?.location || '',
      imageUrl: item?.imageUrl || '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };
  
  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    const selectedSupplier = suppliers.find(s => s.id === data.supplierId);
    onSubmit({
      ...data,
      supplier: selectedSupplier?.name || 'Unknown Supplier'
    });
  };

  const handleDelete = () => {
    if (item && onDelete && window.confirm(`Are you sure you want to delete product: ${item.name}?`)) {
      onDelete(item.id, item.name);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Barcode className="h-4 w-4" /> Product Code
                </FormLabel>
                <FormControl>
                  <Input placeholder="SKU-12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" /> Product Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="Product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Description
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Product description" 
                  className="min-h-[80px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <CategorySelector
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Tag className="h-4 w-4" /> Brand
                </FormLabel>
                <FormControl>
                  <Input placeholder="Brand name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="inStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Hash className="h-4 w-4" /> Current Stock
                </FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="minStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Stock</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Cost Price
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="Wholesale price"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="retailPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Retail Price
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="Customer price"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Storage Location
              </FormLabel>
              <FormControl>
                <Input placeholder="Shelf A1, Bin 3, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Product Image
              </FormLabel>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  {...field}
                />
                {imagePreview && (
                  <div className="mt-2 relative w-24 h-24 border rounded-md overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Product preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-between items-center pt-2">
          <div>
            {item && onDelete && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Product
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {item ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
