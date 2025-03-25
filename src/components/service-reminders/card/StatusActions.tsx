
import React from "react";
import { Button } from "@/components/ui/button";

interface StatusActionsProps {
  onStatusChange: (newStatus: "pending" | "sent" | "completed" | "cancelled") => void;
  currentStatus: string;
}

const StatusActions: React.FC<StatusActionsProps> = ({ onStatusChange, currentStatus }) => {
  if (currentStatus !== 'pending') {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <Button 
        size="sm" 
        variant="outline"
        className="h-7 text-xs"
        onClick={() => onStatusChange('sent')}
      >
        Mark as Sent
      </Button>
      <Button 
        size="sm" 
        variant="outline"
        className="h-7 text-xs"
        onClick={() => onStatusChange('completed')}
      >
        Mark Completed
      </Button>
      <Button 
        size="sm" 
        variant="outline"
        className="h-7 text-xs"
        onClick={() => onStatusChange('cancelled')}
      >
        Cancel
      </Button>
    </div>
  );
};

export default StatusActions;
