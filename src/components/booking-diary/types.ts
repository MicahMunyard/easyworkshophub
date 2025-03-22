
import { BookingType } from "@/types/booking";
import { BookingView } from "@/hooks/bookings/types";

export interface DayViewProps {
  filteredBookings: BookingType[];
  handleBookingClick: (booking: BookingType) => void;
  timeSlots: string[];
}

export interface CalendarNavigationProps {
  date: Date;
  formattedDate: string;
  view: BookingView;
  setView: (view: BookingView) => void;
  navigateDate: (direction: "prev" | "next") => void;
}

export interface BookingsSidebarProps {
  date: Date;
  setDate: (date: Date) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredBookings: BookingType[];
  handleBookingClick: (booking: BookingType) => void;
}

export interface BookingViewProps {
  view: BookingView;
  filteredBookings: BookingType[];
  handleBookingClick: (booking: BookingType) => void;
  timeSlots: string[];
  date: Date;
}

export interface WeekViewProps {
  filteredBookings: BookingType[];
  handleBookingClick: (booking: BookingType) => void;
  timeSlots: string[];
  date: Date;
}

export interface MonthViewProps {
  filteredBookings: BookingType[];
  handleBookingClick: (booking: BookingType) => void;
  date: Date;
}
