
import React from "react";
import { Badge } from "@/components/ui/badge";
import { JobStatus } from "@/types/technician";

interface StatusBadgeProps {
  status: JobStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-amber-100 text-amber-800">Pending</Badge>;
    case 'accepted':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Accepted</Badge>;
    case 'inProgress':
    case 'working':
      return <Badge variant="outline" className="bg-indigo-100 text-indigo-800">In Progress</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
    case 'finished':
      return <Badge variant="outline" className="bg-emerald-100 text-emerald-800">Finished</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
    case 'declined':
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Declined</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default StatusBadge;
