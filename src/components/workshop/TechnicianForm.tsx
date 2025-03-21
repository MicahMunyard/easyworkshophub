
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
import { User, Wrench, Clock } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, { message: "Technician name is required" }),
  specialty: z.string().optional(),
  experience: z.string().optional(),
});

interface TechnicianFormProps {
  technician?: {
    id?: string;
    name: string;
    specialty?: string;
    experience?: string;
  };
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
}

const TechnicianForm: React.FC<TechnicianFormProps> = ({ technician, onSubmit, onCancel }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: technician?.name || "",
      specialty: technician?.specialty || "",
      experience: technician?.experience || "",
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
                <User className="h-4 w-4" /> Technician Name
              </FormLabel>
              <FormControl>
                <Input placeholder="John Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="specialty"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Wrench className="h-4 w-4" /> Specialty
              </FormLabel>
              <FormControl>
                <Input placeholder="Engine, Transmission" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> Experience
              </FormLabel>
              <FormControl>
                <Input placeholder="5 years" {...field} />
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
            {technician?.id ? "Update" : "Add"} Technician
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TechnicianForm;
