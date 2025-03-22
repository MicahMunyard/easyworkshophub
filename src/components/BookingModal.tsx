
import React from "react";
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

  const handleDeleteConfirm = () => {
    if (editedBooking && onDelete) {
      onDelete(editedBooking);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
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
      />
    </>
  );
};

export default BookingModal;
