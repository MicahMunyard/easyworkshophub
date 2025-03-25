
import React from "react";
import { Badge } from "@/components/ui/badge";

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-200 text-yellow-800';
    case 'inProgress':
    case 'working': return 'bg-blue-200 text-blue-800';
    case 'completed': return 'bg-green-200 text-green-800';
    case 'cancelled': return 'bg-red-200 text-red-800';
    default: return 'bg-gray-200 text-gray-800';
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high': return 'bg-red-200 text-red-800';
    case 'medium': return 'bg-yellow-200 text-yellow-800';
    case 'low': return 'bg-green-200 text-green-800';
    default: return 'bg-gray-200 text-gray-800';
  }
};

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
  <Badge className={getStatusColor(status)}>
    {status === 'inProgress' ? 'In Progress' : 
     status.charAt(0).toUpperCase() + status.slice(1)}
  </Badge>
);

interface PriorityBadgeProps {
  priority: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => (
  <Badge className={getPriorityColor(priority)}>
    {priority}
  </Badge>
);
