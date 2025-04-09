
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Building2 } from 'lucide-react';
import { SupplierFormProps, supplierFormSchema } from './types';
import LogoUploadField from './LogoUploadField';
import ContactInfoFields from './ContactInfoFields';
import AddressNotesFields from './AddressNotesFields';

const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onSubmit, onCancel }) => {
  const [logoPreview, setLogoPreview] = useState<string | undefined>(supplier?.logoUrl);

  const form = useForm({
    resolver: zodResolver(supplierFormSchema),
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

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            <LogoUploadField 
              form={form} 
              logoPreview={logoPreview} 
              setLogoPreview={setLogoPreview} 
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
        
        <ContactInfoFields form={form} />
        
        <AddressNotesFields form={form} />
        
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
