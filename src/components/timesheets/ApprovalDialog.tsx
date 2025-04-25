
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TimeEntry } from "@/types/timeEntry";
import { formatDuration } from "@/lib/utils";

interface ApprovalDialogProps {
  entry: TimeEntry | null;
  onClose: () => void;
  onApprove: (entry: TimeEntry) => void;
}

const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  entry,
  onClose,
  onApprove,
}) => {
  if (!entry) return null;

  return (
    <Dialog open={!!entry} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Time Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Date</p>
              <p className="text-sm">{new Date(entry.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Duration</p>
              <p className="text-sm">{formatDuration(entry.duration || 0)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Technician</p>
              <p className="text-sm">{entry.technician_id}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Job ID</p>
              <p className="text-sm">{entry.job_id}</p>
            </div>
          </div>

          {entry.notes && (
            <div>
              <p className="text-sm font-medium">Notes</p>
              <p className="text-sm">{entry.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onApprove(entry)}>
            Approve Time Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDialog;
