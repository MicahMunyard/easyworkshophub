
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Control } from "react-hook-form";
import { FormData } from "./types";

interface TimeEntryJobFieldProps {
  control: Control<FormData>;
}

export function TimeEntryJobField({ control }: TimeEntryJobFieldProps) {
  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_jobs")
        .select("id, title")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <FormField
      control={control}
      name="job_id"
      rules={{ required: "Job is required" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Job</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a job" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
