
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import DayView from "./DayView";
import WeekView from "./WeekView";
import MonthView from "./MonthView";
import { BookingViewProps } from "./types";

const BookingView: React.FC<BookingViewProps> = ({
  view,
  filteredBookings,
  handleBookingClick,
  timeSlots,
  date
}) => {
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
