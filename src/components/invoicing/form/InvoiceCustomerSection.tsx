
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { JobType } from '@/types/job';

interface InvoiceCustomerSectionProps {
  form: UseFormReturn<any>;
  completedJobs: JobType[];
  handleJobChange: (jobId: string) => void;
}

const InvoiceCustomerSection: React.FC<InvoiceCustomerSectionProps> = ({ 
  form, 
  completedJobs, 
  handleJobChange 
}) => {
  return (
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
  );
};

export default InvoiceCustomerSection;
