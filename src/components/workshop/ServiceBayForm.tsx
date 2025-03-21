
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
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
import { Warehouse, Ruler } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, { message: "Bay name is required" }),
  type: z.string().min(1, { message: "Bay type is required" }),
  equipment: z.string().optional(),
});

interface ServiceBayFormProps {
  bay?: {
    id?: string;
    name: string;
    type: string;
    equipment?: string;
  };
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
}

const ServiceBayForm: React.FC<ServiceBayFormProps> = ({ bay, onSubmit, onCancel }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: bay?.name || "",
      type: bay?.type || "",
      equipment: bay?.equipment || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Warehouse className="h-4 w-4" /> Bay Name
              </FormLabel>
              <FormControl>
                <Input placeholder="Bay 1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Ruler className="h-4 w-4" /> Bay Type
              </FormLabel>
              <FormControl>
                <Input placeholder="General Maintenance" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="equipment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipment</FormLabel>
              <FormControl>
                <Input placeholder="Lift, Oil Drain" {...field} />
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
            {bay?.id ? "Update" : "Add"} Service Bay
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ServiceBayForm;
