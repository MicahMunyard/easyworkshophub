
import React from "react";
import ReminderCard from "./ReminderCard";
import { ReminderListProps } from "./types";

const ReminderList: React.FC<ReminderListProps> = ({ 
  reminders, 
  isLoading, 
  onDelete, 
  onUpdateStatus 
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <span className="text-sm text-muted-foreground">Loading reminders...</span>
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No service reminders for this customer
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <ReminderCard 
          key={reminder.id} 
          reminder={reminder}
          onStatusChange={(id, status) => onUpdateStatus && onUpdateStatus(id, status)}
          onDelete={onDelete}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
};

export default ReminderList;
