
import React from "react";
import ReminderCard from "./ReminderCard";
import { ServiceReminder } from "./types";

interface ReminderListProps {
  reminders: ServiceReminder[];
  isLoading: boolean;
  onDelete: (reminderId: string) => Promise<void>;
  onUpdateStatus: (reminderId: string, status: 'pending' | 'sent' | 'completed' | 'cancelled') => Promise<void>;
}

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
          onDelete={onDelete}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
};

export default ReminderList;
