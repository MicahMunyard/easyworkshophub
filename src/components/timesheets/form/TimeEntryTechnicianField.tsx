
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

interface TimeEntryTechnicianFieldProps {
  control: Control<FormData>;
}

export function TimeEntryTechnicianField({ control }: TimeEntryTechnicianFieldProps) {
  const { data: technicians = [] } = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_technicians")
        .select("id, name")
        .order("name");
      return data || [];
    },
  });

  return (
    <FormField
      control={control}
      name="technician_id"
      rules={{ required: "Technician is required" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Technician</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a technician" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {technicians.map((tech) => (
                <SelectItem key={tech.id} value={tech.id}>
                  {tech.name}
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
