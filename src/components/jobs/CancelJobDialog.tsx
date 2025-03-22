
import React from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { JobType } from "@/types/job";

interface CancelJobDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobType | null;
  onConfirm: () => void;
}

const CancelJobDialog: React.FC<CancelJobDialogProps> = ({ isOpen, onClose, job, onConfirm }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Job</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this job? This action cannot be undone.
            {job && (
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="font-medium">{job.id}</p>
                <p className="text-sm">{job.customer} - {job.service}</p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No, Keep Job</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Yes, Cancel Job
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelJobDialog;
