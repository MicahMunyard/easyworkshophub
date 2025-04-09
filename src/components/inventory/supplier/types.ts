
import { Supplier } from "@/types/inventory";
import { z } from "zod";

export const supplierFormSchema = z.object({
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

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;

export type SupplierFormProps = {
  supplier?: Supplier;
  onSubmit: (data: SupplierFormValues) => void;
  onCancel: () => void;
};
