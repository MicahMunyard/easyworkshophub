
import { useState } from "react";
import { BookingType } from "@/types/booking";
import { useToast } from "@/hooks/use-toast";
import { useBookings } from "@/hooks/useBookings";

export const useBookingDiaryState = () => {
  const { toast } = useToast();
  const { 
    date, 
    setDate, 
    view, 
    setView, 
    bookings, 
    isLoading, 
    navigateDate, 
    addBooking, 
    updateBooking, 
    deleteBooking 
  } = useBookings();
  
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBookingClick = (booking: BookingType) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!isDeleting) {
      setIsModalOpen(false);
      setSelectedBooking(null);
    }
  };

  const handleSaveBooking = async (updatedBooking: BookingType) => {
    try {
      const success = await updateBooking(updatedBooking);
      if (success) {
        setIsModalOpen(false);
        setSelectedBooking(null);
        toast({
          title: "Booking Updated",
          description: `${updatedBooking.customer}'s booking has been updated.`,
        });
      }
    } catch (error) {
      console.error("Error saving booking:", error);
      toast({
        title: "Error",
        description: "Failed to update booking. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddNewBooking = async (newBooking: BookingType) => {
    try {
      const success = await addBooking(newBooking);
      if (success) {
        setIsNewBookingModalOpen(false);
        toast({
          title: "Booking Created",
          description: `${newBooking.customer}'s booking has been added.`,
        });
      }
    } catch (error) {
      console.error("Error adding booking:", error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBooking = async (bookingToDelete: BookingType): Promise<boolean> => {
    try {
      setIsDeleting(true);
      console.log("Attempting to delete booking in BookingDiary:", bookingToDelete);
      const success = await deleteBooking(bookingToDelete);
      
      if (success) {
        return true;
      } else {
        throw new Error("Delete operation failed");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast({
        title: "Error",
        description: "Failed to delete booking. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBookings = bookings.filter(booking => 
    booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.car.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.phone.includes(searchTerm)
  );

  return {
    date,
    setDate,
    view,
    setView,
    bookings,
    isLoading,
    navigateDate,
    selectedBooking,
    isModalOpen,
    isNewBookingModalOpen,
    setIsNewBookingModalOpen,
    searchTerm,
    setSearchTerm,
    isFilterOpen,
    setIsFilterOpen,
    isDeleting,
    filteredBookings,
    handleBookingClick,
    handleCloseModal,
    handleSaveBooking,
    handleAddNewBooking,
    handleDeleteBooking
  };
};
