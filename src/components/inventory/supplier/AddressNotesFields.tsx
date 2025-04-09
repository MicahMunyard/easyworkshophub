
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { ClipboardList, MapPin } from 'lucide-react';
import { SupplierFormValues } from './types';

interface AddressNotesFieldsProps {
  form: UseFormReturn<SupplierFormValues>;
}

const AddressNotesFields: React.FC<AddressNotesFieldsProps> = ({ form }) => {
  return (
    <>
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
    </>
  );
};

export default AddressNotesFields;
