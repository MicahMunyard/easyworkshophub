
import React from "react";
import { Bell, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface ReminderHeaderProps {
  serviceType: string;
  dueDate: string;
}

const ReminderHeader: React.FC<ReminderHeaderProps> = ({ serviceType, dueDate }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-muted rounded-full p-2">
        <Bell className="h-4 w-4" />
      </div>
      <div>
        <strong className="text-sm">{serviceType}</strong>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarIcon className="h-3 w-3" />
          <span>Due: {format(new Date(dueDate), "PPP")}</span>
        </div>
      </div>
    </div>
  );
};

export default ReminderHeader;
