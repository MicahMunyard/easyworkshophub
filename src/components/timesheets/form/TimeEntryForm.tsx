
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TimeEntryDurationField } from "./TimeEntryDurationField";
import { TimeEntryNotesField } from "./TimeEntryNotesField";
import { TimeEntryJobField } from "./TimeEntryJobField";
import { TimeEntryTechnicianField } from "./TimeEntryTechnicianField";
import { TimeEntryDateField } from "./TimeEntryDateField";
import { FormData } from "./types";

const formSchema = z.object({
  job_id: z.string().min(1, "Job is required"),
  technician_id: z.string().min(1, "Technician is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  notes: z.string().optional(),
});

interface TimeEntryFormProps {
  onSubmit: (data: FormData) => void;
}

export function TimeEntryForm({ onSubmit }: TimeEntryFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duration: 0,
      notes: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TimeEntryJobField control={form.control} />
        <TimeEntryTechnicianField control={form.control} />
        <TimeEntryDateField control={form.control} />
        <TimeEntryDurationField control={form.control} />
        <TimeEntryNotesField control={form.control} />
        
        <div className="flex justify-end gap-2">
          <Button type="submit">Add Entry</Button>
        </div>
      </form>
    </Form>
  );
}
