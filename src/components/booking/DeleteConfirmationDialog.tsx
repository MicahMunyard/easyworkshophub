
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
import { format } from "date-fns";
import { BookingType } from "@/types/booking";
import { Loader2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingType | null;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  booking,
  onConfirm,
  isDeleting = false,
}) => {
  const handleConfirmClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error in DeleteConfirmationDialog confirmation:", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!isDeleting) {
        onOpenChange(open);
      }
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Booking</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <div>
              Are you sure you want to delete this booking? This action cannot be undone.
            </div>
            {booking && (
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="font-medium">{booking.customer}</p>
                <p className="text-sm">{booking.service} - {format(new Date(booking.date), 'PP')} at {booking.time}</p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirmClick}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Deleting...
              </>
            ) : (
              "Delete Booking"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationDialog;
