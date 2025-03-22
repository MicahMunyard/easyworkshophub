
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import DayView from "./DayView";
import WeekView from "./WeekView";
import MonthView from "./MonthView";
import { BookingViewProps } from "./types";
import { useAuth } from "@/contexts/AuthContext";

const BookingView: React.FC<BookingViewProps> = ({
  view,
  filteredBookings,
  handleBookingClick,
  timeSlots,
  date
}) => {
  const { user } = useAuth();

  // Show empty state if user is not authenticated
  if (!user) {
    return (
      <div className="min-w-[600px] flex items-center justify-center h-96 border rounded-md bg-muted/20">
        <div className="text-center p-6">
          <h3 className="font-medium text-lg mb-2">Please sign in</h3>
          <p className="text-muted-foreground text-sm">
            You need to sign in to view and manage your bookings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-[600px]">
      <Tabs value={view}>
        <TabsContent value="day" className="m-0">
          <DayView 
            filteredBookings={filteredBookings} 
            handleBookingClick={handleBookingClick} 
            timeSlots={timeSlots} 
          />
        </TabsContent>
        <TabsContent value="week" className="m-0">
          <WeekView 
            filteredBookings={filteredBookings} 
            handleBookingClick={handleBookingClick} 
            timeSlots={timeSlots}
            date={date}
          />
        </TabsContent>
        <TabsContent value="month" className="m-0">
          <MonthView 
            filteredBookings={filteredBookings} 
            handleBookingClick={handleBookingClick} 
            date={date}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingView;
