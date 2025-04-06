
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookingType } from "@/types/booking";
import BookingForm from "./booking/BookingForm";
import DeleteConfirmationDialog from "./booking/DeleteConfirmationDialog";
import { useEditBookingForm } from "@/hooks/bookings/useEditBookingForm";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from "@/hooks/use-media-query";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingType | null;
  onSave: (booking: BookingType) => Promise<void>;
  onDelete?: (booking: BookingType) => Promise<boolean>;
}

const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  booking, 
  onSave,
  onDelete 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  const {
    editedBooking,
    date,
    technicians,
    services,
    bays,
    selectedServiceId,
    selectedTechnicianId,
    selectedBayId,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleChange,
    handleSelectChange,
    handleDateChange,
    handleSubmit,
    handleDeleteClick
  } = useEditBookingForm(isOpen, onClose, booking, onSave);

  // Reset state when modal is reopened
  useEffect(() => {
    if (isOpen) {
      setIsDeleting(false);
      setDeleteSuccess(false);
    }
  }, [isOpen]);

  if (!editedBooking) return null;

  const handleDeleteConfirm = async () => {
    if (!editedBooking || !onDelete) return;
    
    setIsDeleting(true);
    console.log("Starting booking deletion process for:", editedBooking);
    
    try {
      const success = await onDelete(editedBooking);
      
      if (success) {
        console.log("Delete successful, closing dialogs");
        setDeleteSuccess(true);
        
        toast({
          title: "Success",
          description: "Booking was successfully deleted",
        });
        
        // Close dialogs after successful deletion
        setIsDeleteDialogOpen(false);
        
        // Brief delay before closing the main modal
        setTimeout(() => {
          onClose();
        }, 300);
      } else {
        throw new Error("Delete operation returned false");
      }
    } catch (error: any) {
      console.error("Error deleting booking in BookingModal:", error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = "An unexpected error occurred while deleting the booking.";
      
      if (error?.message) {
        if (error.message.includes("Could not find booking")) {
          errorMessage = "Could not find the booking to delete. It may have been already removed.";
        } else if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes("permission") || error.message.includes("access")) {
          errorMessage = "You don't have permission to delete this booking.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen && !isDeleting && !deleteSuccess} onOpenChange={(open) => {
        if (!isDeleting && !deleteSuccess && !open) {
          onClose();
        }
      }}>
        <DialogContent className={`${isMobile ? 'w-[95%] p-4 max-h-[90vh] overflow-y-auto' : 'sm:max-w-[500px]'}`}>
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Make changes to the booking details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <BookingForm
            booking={editedBooking}
            date={date}
            services={services}
            technicians={technicians}
            bays={bays}
            selectedServiceId={selectedServiceId}
            selectedTechnicianId={selectedTechnicianId}
            selectedBayId={selectedBayId}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
            handleDateChange={handleDateChange}
            handleSubmit={handleSubmit}
            onClose={onClose}
            isEditing={true}
            onDeleteClick={handleDeleteClick}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        booking={editedBooking}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default BookingModal;
