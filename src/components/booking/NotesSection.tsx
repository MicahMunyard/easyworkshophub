
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface NotesSectionProps {
  notes: string | undefined;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes, handleChange }) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="notes">Notes</Label>
      <Textarea
        id="notes"
        name="notes"
        value={notes || ""}
        onChange={handleChange}
        placeholder="Add notes about this booking"
        className="min-h-[100px]"
      />
    </div>
  );
};

export default NotesSection;
