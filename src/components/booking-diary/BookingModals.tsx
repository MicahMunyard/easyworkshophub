
import React from "react";
import BookingModal from "@/components/BookingModal";
import NewBookingModal from "@/components/NewBookingModal";
import { BookingType } from "@/types/booking";

interface BookingModalsProps {
  isModalOpen: boolean;
  handleCloseModal: () => void;
  selectedBooking: BookingType | null;
  handleSaveBooking: (booking: BookingType) => Promise<void>;
  handleDeleteBooking: (booking: BookingType) => Promise<boolean>;
  isNewBookingModalOpen: boolean;
  setIsNewBookingModalOpen: (isOpen: boolean) => void;
  handleAddNewBooking: (booking: BookingType) => Promise<void>;
}

const BookingModals: React.FC<BookingModalsProps> = ({
  isModalOpen,
  handleCloseModal,
  selectedBooking,
  handleSaveBooking,
  handleDeleteBooking,
  isNewBookingModalOpen,
  setIsNewBookingModalOpen,
  handleAddNewBooking
}) => {
  return (
    <>
      <BookingModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        booking={selectedBooking}
        onSave={handleSaveBooking}
        onDelete={handleDeleteBooking}
      />

      <NewBookingModal
        isOpen={isNewBookingModalOpen}
        onClose={() => setIsNewBookingModalOpen(false)}
        onSave={handleAddNewBooking}
      />
    </>
  );
};

export default BookingModals;
