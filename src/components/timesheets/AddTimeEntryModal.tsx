
import React from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { TimeEntry } from "@/types/timeEntry";
import { TimeEntryJobField } from "./form/TimeEntryJobField";
import { TimeEntryTechnicianField } from "./form/TimeEntryTechnicianField";
import { TimeEntryDateField } from "./form/TimeEntryDateField";
import { FormData } from "./form/types";

interface AddTimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (entry: Partial<TimeEntry>) => void;
}

export function AddTimeEntryModal({ isOpen, onClose, onAdd }: AddTimeEntryModalProps) {
  const form = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    // Ensure all required fields are passed to onAdd
    onAdd({
      job_id: data.job_id,
      technician_id: data.technician_id,
      date: format(data.date, "yyyy-MM-dd"),
      start_time: new Date().toISOString(),
      duration: Number(data.duration) * 60, // Convert to seconds
      notes: data.notes,
      approval_status: "pending"
    });
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Time Entry</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TimeEntryJobField control={form.control} />
            <TimeEntryTechnicianField control={form.control} />
            <TimeEntryDateField control={form.control} />

            <FormField
              control={form.control}
              name="duration"
              rules={{ required: "Duration is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Entry</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
