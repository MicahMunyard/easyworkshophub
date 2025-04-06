
import React, { useState } from "react";
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
  const [localIsDeleting, setLocalIsDeleting] = useState(false);
  const effectiveIsDeleting = isDeleting || localIsDeleting;

  const handleConfirmClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (effectiveIsDeleting) return; // Prevent multiple clicks
    
    try {
      setLocalIsDeleting(true);
      console.log("Starting delete operation for booking:", booking);
      await onConfirm();
      console.log("Delete operation completed successfully");
    } catch (error) {
      console.error("Error in DeleteConfirmationDialog confirmation:", error);
    } finally {
      setLocalIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    
    try {
      return format(new Date(dateString), 'PP');
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString || "Unknown date";
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!effectiveIsDeleting) {
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
                <p className="font-medium">{booking.customer || "Unknown customer"}</p>
                <p className="text-sm">
                  {booking.service || "Unknown service"} - {formatDate(booking.date)} at {booking.time || "Unknown time"}
                </p>
                <p className="text-xs text-muted-foreground">Booking ID: {booking.id || "Unknown"}</p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={effectiveIsDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirmClick}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={effectiveIsDeleting}
          >
            {effectiveIsDeleting ? (
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
