
import React from "react";
import { ReviewRequestsListProps } from "./types";
import { Clock, Mail, User, Calendar, Check, Eye } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatDistanceToNow, format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  opened: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
};

const statusIcons = {
  sent: Mail,
  opened: Eye,
  completed: Check
};

const ReviewRequestsList: React.FC<ReviewRequestsListProps> = ({ requests, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading review requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No review requests found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Template</TableHead>
            <TableHead>Sent Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Activity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => {
            const StatusIcon = statusIcons[request.status];
            
            let lastActivity = request.sent_date;
            let lastActivityType = "Sent";
            
            if (request.completed_date) {
              lastActivity = request.completed_date;
              lastActivityType = "Completed";
            } else if (request.opened_date) {
              lastActivity = request.opened_date;
              lastActivityType = "Opened";
            }

            return (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{request.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{request.customer_email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{request.template_name}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{format(new Date(request.sent_date), "MMM d, yyyy")}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(request.sent_date), "h:mm a")}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={`${statusColors[request.status]} capitalize flex items-center gap-1 w-fit`}
                    variant="outline"
                  >
                    <StatusIcon className="h-3 w-3" />
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {lastActivityType} {formatDistanceToNow(new Date(lastActivity), { addSuffix: true })}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReviewRequestsList;
