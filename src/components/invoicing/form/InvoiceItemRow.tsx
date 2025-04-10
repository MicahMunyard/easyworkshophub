
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

interface InvoiceItemRowProps {
  index: number;
  form: UseFormReturn<any>;
  updateItemTotal: (index: number) => void;
  removeItem: (index: number) => void;
  isRemoveDisabled: boolean;
}

const InvoiceItemRow: React.FC<InvoiceItemRowProps> = ({
  index,
  form,
  updateItemTotal,
  removeItem,
  isRemoveDisabled
}) => {
  return (
    <div className="grid grid-cols-12 gap-4 items-end">
      <div className="col-span-4">
        <FormField
          control={form.control}
          name={`items.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-2">
        <FormField
          control={form.control}
          name={`items.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1} 
                  {...field}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                    updateItemTotal(index);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-2">
        <FormField
          control={form.control}
          name={`items.${index}.unitPrice`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Price</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={0} 
                  step={0.01}
                  {...field}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                    updateItemTotal(index);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-2">
        <FormField
          control={form.control}
          name={`items.${index}.taxRate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax Rate (%)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={0} 
                  step={0.1}
                  {...field}
                  value={field.value || 0}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                    setTimeout(() => {
                      const items = form.getValues().items;
                      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
                      const taxTotal = items.reduce((sum, item) => {
                        const taxRate = item.taxRate || 0;
                        return sum + (item.total * (taxRate / 100));
                      }, 0);
                      const total = subtotal + taxTotal;
                      
                      form.setValue('taxTotal', taxTotal);
                      form.setValue('total', total);
                    }, 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-1">
        <FormField
          control={form.control}
          name={`items.${index}.total`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  readOnly 
                  value={field.value.toFixed(2)} 
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-1">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon"
          onClick={() => removeItem(index)}
          disabled={isRemoveDisabled}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default InvoiceItemRow;
