
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { BookingType } from "@/types/booking";
import BookingForm from "./booking/BookingForm";
import { useNewBookingForm } from "@/hooks/bookings/useNewBookingForm";

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: BookingType) => void;
}

const NewBookingModal: React.FC<NewBookingModalProps> = ({ isOpen, onClose, onSave }) => {
  const {
    newBooking,
    date,
    technicians,
    services,
    bays,
    selectedServiceId,
    selectedTechnicianId,
    selectedBayId,
    handleChange,
    handleSelectChange,
    handleDateChange,
    handleSubmit,
    handleCloseModal
  } = useNewBookingForm(isOpen, onClose, onSave);

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Booking</DialogTitle>
          <DialogDescription>
            Enter the details for the new booking.
          </DialogDescription>
        </DialogHeader>
        <BookingForm
          booking={newBooking}
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
          onClose={handleCloseModal}
          isEditing={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewBookingModal;
