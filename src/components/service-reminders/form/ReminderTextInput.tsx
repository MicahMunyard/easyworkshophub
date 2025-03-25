
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReminderTextInputProps {
  reminderText: string;
  setReminderText: (text: string) => void;
}

const ReminderTextInput: React.FC<ReminderTextInputProps> = ({
  reminderText,
  setReminderText
}) => {
  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label htmlFor="reminder-text" className="text-right pt-2">
        Reminder Text
      </Label>
      <Textarea
        id="reminder-text"
        value={reminderText}
        onChange={(e) => setReminderText(e.target.value)}
        className="col-span-3 min-h-[100px]"
        placeholder="Optional: Add custom text for this reminder..."
      />
    </div>
  );
};

export default ReminderTextInput;
