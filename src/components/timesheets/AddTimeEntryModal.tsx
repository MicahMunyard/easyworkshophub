
import React from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TimeEntry } from "@/types/timeEntry";
import { TimeEntryForm } from "./form/TimeEntryForm";
import { FormData } from "./form/types";

interface AddTimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (entry: Partial<TimeEntry>) => void;
}

export function AddTimeEntryModal({ isOpen, onClose, onAdd }: AddTimeEntryModalProps) {
  const handleSubmit = (data: FormData) => {
    onAdd({
      job_id: data.job_id,
      technician_id: data.technician_id,
      date: format(data.date, "yyyy-MM-dd"),
      start_time: new Date().toISOString(),
      duration: Number(data.duration) * 60, // Convert to seconds
      notes: data.notes,
      approval_status: "pending"
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Time Entry</DialogTitle>
        </DialogHeader>
        <TimeEntryForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
