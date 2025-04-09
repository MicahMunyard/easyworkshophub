
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
import { Supplier } from '@/types/inventory';
import { Building2, User, Mail, Phone, MapPin, ClipboardList, Upload, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Supplier name is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  contactPerson: z.string().min(1, { message: 'Contact person is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().min(1, { message: 'Phone number is required' }),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  notes: z.string().optional(),
  logoUrl: z.string().optional(),
});

type SupplierFormProps = {
  supplier?: Supplier;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
};

const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onSubmit, onCancel }) => {
  const [logoPreview, setLogoPreview] = useState<string | undefined>(supplier?.logoUrl);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: supplier?.name || '',
      category: supplier?.category || '',
      contactPerson: supplier?.contactPerson || '',
      email: supplier?.email || '',
      phone: supplier?.phone || '',
      address: supplier?.address || '',
      status: supplier?.status || 'active',
      notes: supplier?.notes || '',
      logoUrl: supplier?.logoUrl || '',
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 1MB)
    if (file.size > 1024 * 1024) {
      alert('File size must be less than 1MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLogoPreview(result);
      form.setValue('logoUrl', result);
    };
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setLogoPreview(undefined);
    form.setValue('logoUrl', '');
  };

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="w-full md:w-3/4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Company Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="w-full md:w-1/4 flex flex-col items-center">
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-center block">Logo</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center">
                      <div className="mb-2 relative">
                        <Avatar className={cn(
                          "h-20 w-20 bg-muted",
                          !logoPreview && "border-2 border-dashed border-muted-foreground/50 p-2"
                        )}>
                          {logoPreview ? (
                            <AvatarImage src={logoPreview} alt="Supplier logo" />
                          ) : (
                            <AvatarFallback>
                              <Building2 className="h-10 w-10 text-muted-foreground/50" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        {logoPreview && (
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={clearLogo}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        <Upload className="h-3 w-3 mr-2" /> Upload Logo
                      </Button>
                      <input 
                        type="hidden" 
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="Cleaning Supplies, Auto Parts, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Contact Person
                </FormLabel>
                <FormControl>
                  <Input placeholder="Contact name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </FormLabel>
                <FormControl>
                  <Input placeholder="Email address" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone
                </FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Address
              </FormLabel>
              <FormControl>
                <Input placeholder="Company address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" /> Notes
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional notes about the supplier" 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {supplier ? 'Update Supplier' : 'Add Supplier'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SupplierForm;
