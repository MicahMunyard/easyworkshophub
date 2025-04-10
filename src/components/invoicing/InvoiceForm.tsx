
import React from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash } from "lucide-react";
import { Invoice, InvoiceItem, InvoiceStatus } from '@/types/invoice';
import { JobType } from '@/types/job';

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, { message: "Invoice number is required" }),
  jobId: z.string().min(1, { message: "Job is required" }),
  customerName: z.string().min(1, { message: "Customer name is required" }),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  date: z.date(),
  dueDate: z.date(),
  items: z.array(z.object({
    id: z.string(),
    description: z.string().min(1, { message: "Description is required" }),
    quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
    unitPrice: z.number().min(0, { message: "Price cannot be negative" }),
    total: z.number(),
    taxRate: z.number().optional()
  })).min(1, { message: "At least one item is required" }),
  subtotal: z.number(),
  taxTotal: z.number(),
  total: z.number(),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional()
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  onSubmit: (data: Omit<Invoice, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>) => void;
  completedJobs: JobType[];
  onCancel: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSubmit, completedJobs, onCancel }) => {
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      jobId: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: [{ id: `item-${Date.now()}`, description: "", quantity: 1, unitPrice: 0, total: 0 }],
      subtotal: 0,
      taxTotal: 0,
      total: 0,
      notes: "",
      termsAndConditions: "Payment is due within 30 days."
    }
  });

  const watchItems = form.watch('items');

  const handleJobChange = (jobId: string) => {
    const selectedJob = completedJobs.find(job => job.id === jobId);
    if (selectedJob) {
      form.setValue('customerName', selectedJob.customer);
      form.setValue('items', [
        {
          id: `item-${Date.now()}`,
          description: selectedJob.service,
          quantity: 1,
          unitPrice: 0,
          total: 0
        }
      ]);
    }
  };

  React.useEffect(() => {
    const items = form.getValues().items;
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxTotal = items.reduce((sum, item) => {
      const taxRate = item.taxRate || 0;
      return sum + (item.total * (taxRate / 100));
    }, 0);
    const total = subtotal + taxTotal;

    form.setValue('subtotal', subtotal);
    form.setValue('taxTotal', taxTotal);
    form.setValue('total', total);
  }, [watchItems, form]);

  const updateItemTotal = (index: number) => {
    const items = form.getValues().items;
    const item = items[index];
    const newTotal = item.quantity * item.unitPrice;
    const updatedItems = [...items];
    updatedItems[index] = { ...item, total: newTotal };
    form.setValue('items', updatedItems);
  };

  const addItem = () => {
    const items = form.getValues().items;
    form.setValue('items', [...items, { id: `item-${Date.now()}`, description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    const items = form.getValues().items;
    if (items.length > 1) {
      form.setValue('items', items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (data: InvoiceFormValues) => {
    // Ensure all required fields are properly set before submitting
    const formattedInvoice: Omit<Invoice, 'id' | 'customerId' | 'createdAt' | 'updatedAt'> = {
      invoiceNumber: data.invoiceNumber,
      jobId: data.jobId,
      customerName: data.customerName,
      customerEmail: data.customerEmail || undefined,
      customerPhone: data.customerPhone || undefined,
      date: format(data.date, 'yyyy-MM-dd'),
      dueDate: format(data.dueDate, 'yyyy-MM-dd'),
      items: data.items as InvoiceItem[], // Explicit cast to ensure TypeScript recognizes all required fields
      subtotal: data.subtotal,
      taxTotal: data.taxTotal,
      total: data.total,
      notes: data.notes || undefined,
      termsAndConditions: data.termsAndConditions || undefined,
      status: 'pending' as InvoiceStatus
    };
    
    onSubmit(formattedInvoice);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Job</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleJobChange(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a completed job" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {completedJobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.id} - {job.service} ({job.customer})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Invoice Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Invoice Items</h3>
            <Button type="button" variant="outline" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {watchItems.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
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
                    disabled={watchItems.length <= 1}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-end space-y-2 pt-4 border-t">
            <div className="flex justify-between w-60">
              <span className="text-sm">Subtotal:</span>
              <span className="font-medium">${form.watch('subtotal').toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-60">
              <span className="text-sm">Tax:</span>
              <span className="font-medium">${form.watch('taxTotal').toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-60 text-lg font-bold">
              <span>Total:</span>
              <span>${form.watch('total').toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Additional notes for the customer" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="termsAndConditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terms and Conditions</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Payment terms and conditions" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create Invoice</Button>
        </div>
      </form>
    </Form>
  );
};

export default InvoiceForm;
