
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Invoice, InvoiceStatus, InvoiceItem } from "@/types/invoice";
import { format } from "date-fns";
import { JobType } from "@/types/job";
import { useJobParts } from "@/hooks/invoicing/useJobParts";

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

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export const useInvoiceForm = (completedJobs: JobType[]) => {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const { parts: approvedParts } = useJobParts(selectedBookingId);
  
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

  useEffect(() => {
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

  const handleJobChange = (jobId: string) => {
    const selectedJob = completedJobs.find(job => job.id === jobId);
    if (selectedJob) {
      setSelectedBookingId(jobId);
      form.setValue('customerName', selectedJob.customer);
      
      const jobWithContact = selectedJob as JobType & { customerEmail?: string, customerPhone?: string };
      
      if (jobWithContact.customerEmail) {
        form.setValue('customerEmail', jobWithContact.customerEmail);
      }
      
      if (jobWithContact.customerPhone) {
        form.setValue('customerPhone', jobWithContact.customerPhone);
      }
      
      // Handle the cost properly with type checking and fallbacks
      let jobCost = 0;
      if (typeof selectedJob.cost === 'number') {
        jobCost = selectedJob.cost;
      } else if (selectedJob.cost !== undefined) {
        const parsedCost = parseFloat(String(selectedJob.cost));
        jobCost = isNaN(parsedCost) ? 0 : parsedCost;
      }
      
      // Start with the service item
      const invoiceItems = [
        {
          id: `item-${Date.now()}`,
          description: selectedJob.service,
          quantity: 1,
          unitPrice: jobCost,
          total: jobCost
        }
      ];
      
      form.setValue('items', invoiceItems);
    }
  };

  // Update invoice items when approved parts are loaded
  useEffect(() => {
    if (approvedParts.length > 0 && selectedBookingId) {
      const currentItems = form.getValues().items;
      
      // Keep only the first item (service) and add parts
      const serviceItem = currentItems[0];
      const partItems = approvedParts.map(part => {
        const unitPrice = part.unit_cost || (part.inventory_item as any)?.price || 0;
        const total = part.total_cost || (unitPrice * part.quantity);
        
        return {
          id: `part-${part.id}`,
          description: part.part_code ? `${part.part_name} (${part.part_code})` : part.part_name,
          quantity: part.quantity,
          unitPrice: unitPrice,
          total: total
        };
      });
      
      form.setValue('items', [serviceItem, ...partItems]);
    }
  }, [approvedParts, selectedBookingId]);

  const formatInvoiceForSubmission = (data: InvoiceFormValues) => {
    return {
      invoiceNumber: data.invoiceNumber,
      jobId: data.jobId,
      customerName: data.customerName,
      customerEmail: data.customerEmail || undefined,
      customerPhone: data.customerPhone || undefined,
      date: format(data.date, 'yyyy-MM-dd'),
      dueDate: format(data.dueDate, 'yyyy-MM-dd'),
      items: data.items as InvoiceItem[],
      subtotal: data.subtotal,
      taxTotal: data.taxTotal,
      total: data.total,
      notes: data.notes || undefined,
      termsAndConditions: data.termsAndConditions || undefined,
      status: 'pending' as InvoiceStatus
    };
  };

  return {
    form,
    watchItems,
    updateItemTotal,
    addItem,
    removeItem,
    handleJobChange,
    formatInvoiceForSubmission
  };
};
