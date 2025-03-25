
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Trash2 } from "lucide-react";
import { ReminderCardProps } from "./types";

// Import our newly created components
import ReminderStatusBadge from "./card/ReminderStatusBadge";
import ReminderHeader from "./card/ReminderHeader";
import NotificationMethods from "./card/NotificationMethods";
import StatusActions from "./card/StatusActions";

const ReminderCard: React.FC<ReminderCardProps> = ({ 
  reminder, 
  onDelete, 
  onUpdateStatus,
  onStatusChange
}) => {
  const handleStatusChange = (newStatus: "pending" | "sent" | "completed" | "cancelled") => {
    if (onStatusChange) {
      onStatusChange(reminder.id, newStatus);
    } else if (onUpdateStatus) {
      onUpdateStatus(reminder.id, newStatus);
    }
  };

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <ReminderHeader 
              serviceType={reminder.service_type} 
              dueDate={reminder.due_date} 
            />
            
            <div className="flex items-center gap-2">
              <ReminderStatusBadge status={reminder.status} />
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-red-500"
                  onClick={() => onDelete(reminder.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete reminder</span>
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Car className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{reminder.vehicle_info}</span>
          </div>
          
          <NotificationMethods methods={reminder.notification_method} />
          
          {reminder.reminder_text && (
            <div className="text-sm border-t pt-2 mt-1">
              {reminder.reminder_text}
            </div>
          )}
          
          <StatusActions 
            onStatusChange={handleStatusChange} 
            currentStatus={reminder.status} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReminderCard;
