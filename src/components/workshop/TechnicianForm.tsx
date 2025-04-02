
import React, { useState } from "react";
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
import { User, Wrench, Clock, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(1, { message: "Technician name is required" }),
  specialty: z.string().optional(),
  experience: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address" }).optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }).optional(),
  createLogin: z.boolean().default(false),
  tech_code: z.string().optional(),
});

export type TechnicianFormValues = z.infer<typeof formSchema>;

interface TechnicianFormProps {
  technician?: {
    id?: string;
    name: string;
    specialty?: string;
    experience?: string;
    email?: string;
    tech_code?: string;
  };
  onSubmit: (values: TechnicianFormValues) => void;
  onCancel: () => void;
}

const TechnicianForm: React.FC<TechnicianFormProps> = ({ technician, onSubmit, onCancel }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isNewTechnician = !technician?.id;

  const form = useForm<TechnicianFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: technician?.name || "",
      specialty: technician?.specialty || "",
      experience: technician?.experience || "",
      email: technician?.email || "",
      tech_code: technician?.tech_code || "",
      createLogin: false,
      password: "",
    },
  });

  const createLogin = form.watch("createLogin");

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
        
        <FormField
          control={form.control}
          name="tech_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Lock className="h-4 w-4" /> Technician Access Code
              </FormLabel>
              <FormControl>
                <Input placeholder="123456" {...field} />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                The technician will use this code to access the technician portal
              </p>
            </FormItem>
          )}
        />

        {isNewTechnician && (
          <FormField
            control={form.control}
            name="createLogin"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Create Portal Credentials</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Enable email/password login for the technician portal
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
        
        {(createLogin || !isNewTechnician) && (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Mail className="h-4 w-4" /> Email Address
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="technician@example.com" 
                      type="email" 
                      {...field} 
                      disabled={!isNewTechnician && !!technician?.email}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isNewTechnician && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Lock className="h-4 w-4" /> Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}
        
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
