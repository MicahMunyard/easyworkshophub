
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TimeEntry } from "@/types/timeEntry";
import { formatDuration } from "@/lib/utils";

interface TimeEntriesTableProps {
  entries: TimeEntry[];
  isLoading: boolean;
  onApprove: (entry: TimeEntry) => void;
}

const TimeEntriesTable: React.FC<TimeEntriesTableProps> = ({
  entries,
  isLoading,
  onApprove,
}) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Technician</TableHead>
            <TableHead>Job ID</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
              <TableCell>{entry.technician_id}</TableCell>
              <TableCell>{entry.job_id}</TableCell>
              <TableCell>{formatDuration(entry.duration || 0)}</TableCell>
              <TableCell>{entry.approval_status}</TableCell>
              <TableCell className="text-right">
                {entry.approval_status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApprove(entry)}
                  >
                    Approve
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TimeEntriesTable;
