
import { BookingType } from "@/types/booking";
import { useBookingNavigation } from "./useBookingNavigation";
import { useBookingFetch } from "./useBookingFetch";
import { useBookingMutations } from "./useBookingMutations";
import { UseBookingsReturn, BookingView } from "./types";

export const useBookings = (initialDate = new Date(), initialView: BookingView = "day"): UseBookingsReturn => {
  const { date, setDate, view, setView, navigateDate } = useBookingNavigation(initialDate, initialView);
  const { bookings, setBookings, isLoading, fetchBookings } = useBookingFetch(date, view);
  const { addBooking, updateBooking, deleteBooking } = useBookingMutations(bookings, setBookings, fetchBookings);

  return {
    date,
    setDate,
    view,
    setView,
    bookings,
    isLoading,
    navigateDate,
    addBooking,
    updateBooking,
    deleteBooking,
    fetchBookings
  };
};
