
import React from "react";
import { Badge } from "@/components/ui/badge";

interface ReminderStatusBadgeProps {
  status: "pending" | "sent" | "completed" | "cancelled";
}

const ReminderStatusBadge: React.FC<ReminderStatusBadgeProps> = ({ status }) => {
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

export default ReminderStatusBadge;
