
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, CalendarIcon, Car, Trash2, Mail, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ReminderCardProps } from "./types";

const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onDelete, onUpdateStatus }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Sent</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="bg-muted rounded-full p-2">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <strong className="text-sm">{reminder.service_type}</strong>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarIcon className="h-3 w-3" />
                  <span>Due: {format(new Date(reminder.due_date), "PPP")}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusBadge(reminder.status)}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                onClick={() => onDelete(reminder.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete reminder</span>
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Car className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{reminder.vehicle_info}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Notify via:</span>
            <div className="flex gap-1">
              {reminder.notification_method.includes('email') && (
                <Badge variant="secondary" className="text-xs py-0 h-5">
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </Badge>
              )}
              {reminder.notification_method.includes('sms') && (
                <Badge variant="secondary" className="text-xs py-0 h-5">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  SMS
                </Badge>
              )}
            </div>
          </div>
          
          {reminder.reminder_text && (
            <div className="text-sm border-t pt-2 mt-1">
              {reminder.reminder_text}
            </div>
          )}
          
          {reminder.status === 'pending' && (
            <div className="flex items-center gap-2 mt-2">
              <Button 
                size="sm" 
                variant="outline"
                className="h-7 text-xs"
                onClick={() => onUpdateStatus(reminder.id, 'sent')}
              >
                Mark as Sent
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="h-7 text-xs"
                onClick={() => onUpdateStatus(reminder.id, 'completed')}
              >
                Mark Completed
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="h-7 text-xs"
                onClick={() => onUpdateStatus(reminder.id, 'cancelled')}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReminderCard;
