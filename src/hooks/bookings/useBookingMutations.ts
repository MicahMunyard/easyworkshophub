
import { BookingType } from "@/types/booking";
import { useAddBooking } from "./mutations/useAddBooking";
import { useUpdateBooking } from "./mutations/useUpdateBooking";
import { useDeleteBooking } from "./mutations/useDeleteBooking";

export const useBookingMutations = (
  bookings: BookingType[],
  setBookings: React.Dispatch<React.SetStateAction<BookingType[]>>,
  fetchBookings: () => Promise<void>
) => {
  const { addBooking } = useAddBooking(bookings, setBookings, fetchBookings);
  const { updateBooking } = useUpdateBooking(bookings, setBookings, fetchBookings);
  const { deleteBooking } = useDeleteBooking(bookings, setBookings, fetchBookings);

  return {
    addBooking,
    updateBooking,
    deleteBooking
  };
};
