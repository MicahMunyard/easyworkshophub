
import { BookingType } from "@/types/booking";

export interface DayViewProps {
  filteredBookings: BookingType[];
  handleBookingClick: (booking: BookingType) => void;
  timeSlots: string[];
}

export interface CalendarNavigationProps {
  date: Date;
  formattedDate: string;
  view: string;
  setView: (view: string) => void;
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
  view: string;
  filteredBookings: BookingType[];
  handleBookingClick: (booking: BookingType) => void;
  timeSlots: string[];
}
