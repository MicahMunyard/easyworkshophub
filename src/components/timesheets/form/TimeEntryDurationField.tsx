
import React from "react";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormData } from "./types";

interface TimeEntryDurationFieldProps {
  control: Control<FormData>;
}

export function TimeEntryDurationField({ control }: TimeEntryDurationFieldProps) {
  return (
    <FormField
      control={control}
      name="duration"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Duration (minutes)</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              {...field} 
              onChange={e => field.onChange(Number(e.target.value))}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
