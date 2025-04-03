
import React from "react";
import { Badge } from "@/components/ui/badge";

interface PriorityBadgeProps {
  priority: string;
}

const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return <Badge variant="destructive" className="ml-2">High Priority</Badge>;
    case 'medium':
      return <Badge variant="secondary" className="ml-2">Medium</Badge>;
    default:
      return null;
  }
};

export default PriorityBadge;
