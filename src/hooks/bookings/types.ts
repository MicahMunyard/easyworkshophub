
import { BookingType } from "@/types/booking";

export type BookingView = "day" | "week" | "month";

export interface UseBookingsReturn {
  date: Date;
  setDate: (date: Date) => void;
  view: string;
  setView: (view: string) => void;
  bookings: BookingType[];
  isLoading: boolean;
  navigateDate: (direction: "prev" | "next") => void;
  addBooking: (newBooking: BookingType) => Promise<boolean>;
  updateBooking: (updatedBooking: BookingType) => Promise<boolean>;
  deleteBooking: (bookingToDelete: BookingType) => Promise<boolean>;
  fetchBookings: () => Promise<void>;
}
