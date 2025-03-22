
import React, { useState } from "react";
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

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingType | null;
  onSave: (booking: BookingType) => void;
  onDelete?: (booking: BookingType) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  booking, 
  onSave,
  onDelete 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
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

  if (!editedBooking) return null;

  const handleDeleteConfirm = async () => {
    if (editedBooking && onDelete) {
      setIsDeleting(true);
      try {
        await onDelete(editedBooking);
      } catch (error) {
        console.error("Error deleting booking:", error);
      } finally {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen && !isDeleting} onOpenChange={(open) => {
        if (!isDeleting) {
          onClose();
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
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
