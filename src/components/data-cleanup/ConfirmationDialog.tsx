
import React from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import {
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface ConfirmationDialogProps {
  isLoading: boolean;
  onConfirm: (e: React.MouseEvent) => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ 
  isLoading, 
  onConfirm 
}) => {
  return (
    <AlertDialogHeader>
      <AlertDialogTitle className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        Clear All Your Data?
      </AlertDialogTitle>
      <AlertDialogDescription>
        This action will permanently delete all your workshop data including bookings, jobs, inventory items, and settings.
        This cannot be undone.
      </AlertDialogDescription>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          disabled={isLoading}
          className="bg-destructive hover:bg-destructive/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Clearing...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Yes, Clear My Data
            </>
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogHeader>
  );
};

export default ConfirmationDialog;
