
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import CalendarNavigation from "@/components/booking-diary/CalendarNavigation";
import BookingView from "@/components/booking-diary/BookingView";
import { BookingType } from "@/types/booking";
import { BookingView as BookingViewType } from "@/hooks/bookings/types";

interface BookingContentProps {
  date: Date;
  view: BookingViewType;
  setView: (view: BookingViewType) => void;
  navigateDate: (direction: "prev" | "next") => void;
  isLoading: boolean;
  filteredBookings: BookingType[];
  handleBookingClick: (booking: BookingType) => void;
  timeSlots: string[];
}

const BookingContent: React.FC<BookingContentProps> = ({
  date,
  view,
  setView,
  navigateDate,
  isLoading,
  filteredBookings,
  handleBookingClick,
  timeSlots
}) => {
  const formattedDate = format(date, "EEEE, MMMM d, yyyy");

  return (
    <div className="flex-1">
      <Card className="overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <CalendarNavigation
            date={date}
            formattedDate={formattedDate}
            view={view}
            setView={setView}
            navigateDate={navigateDate}
          />
        </CardHeader>
        <CardContent className="p-0 pt-4 overflow-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading bookings...</p>
            </div>
          ) : (
            <BookingView
              view={view}
              filteredBookings={filteredBookings}
              handleBookingClick={handleBookingClick}
              timeSlots={timeSlots}
              date={date}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingContent;
