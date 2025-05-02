
import React from "react";
import { Badge } from "@/components/ui/badge";

interface JobBadgesProps {
  status: string;
  priority: string;
}

const JobBadges: React.FC<JobBadgesProps> = ({ status, priority }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status={status} />
      <PriorityBadge priority={priority} />
    </div>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
    case 'inProgress':
    case 'working':
      return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">In Progress</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
    case 'finished':
      return <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">Finished</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">High Priority</Badge>;
    case 'medium':
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Medium Priority</Badge>;
    case 'low':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Low Priority</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

export default JobBadges;
