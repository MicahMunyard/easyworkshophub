
import React, { useMemo } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays,
  isSameMonth,
  isSameDay
} from "date-fns";
import { cn } from "@/lib/utils";
import { BookingType } from "@/types/booking";

interface MonthViewProps {
  filteredBookings: BookingType[];
  handleBookingClick: (booking: BookingType) => void;
  date: Date;
}

const MonthView: React.FC<MonthViewProps> = ({ 
  filteredBookings, 
  handleBookingClick,
  date 
}) => {
  // Generate the days for the month view calendar
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    // Group days into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  }, [date]);

  // Get bookings for a specific day
  const getBookingsForDay = (day: Date) => {
    return filteredBookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return (
        bookingDate.getDate() === day.getDate() &&
        bookingDate.getMonth() === day.getMonth() &&
        bookingDate.getFullYear() === day.getFullYear()
      );
    });
  };

  // Function to get the appropriate color classes based on booking status
  const getStatusClasses = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-workshop-blue/10 border-l-2 border-workshop-blue";
      case "completed":
        return "bg-green-50 border-l-2 border-green-500 dark:bg-green-900/20";
      case "cancelled":
        return "bg-red-50 border-l-2 border-red-500 dark:bg-red-900/20";
      default: // pending
        return "bg-amber-50 border-l-2 border-amber-400 dark:bg-amber-900/20";
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
          <div key={dayName} className="text-center text-sm text-muted-foreground font-medium py-2">
            {dayName}
          </div>
        ))}
        {calendarDays.map((week, weekIndex) => (
          <React.Fragment key={`week-${weekIndex}`}>
            {week.map((day, dayIndex) => {
              const dayBookings = getBookingsForDay(day);
              const isCurrentMonth = isSameMonth(day, date);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div 
                  key={`day-${dayIndex}`} 
                  className={cn(
                    "min-h-[100px] p-1 border rounded-md",
                    !isCurrentMonth && "opacity-40 bg-muted/30",
                    isToday && "ring-2 ring-primary ring-offset-2",
                  )}
                >
                  <div className="text-right text-sm p-1">
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayBookings.slice(0, 3).map((booking) => (
                      <div
                        key={booking.id}
                        className={cn(
                          "text-xs p-1 rounded truncate cursor-pointer",
                          getStatusClasses(booking.status)
                        )}
                        onClick={() => handleBookingClick(booking)}
                      >
                        {booking.time} - {booking.customer}
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-xs text-center text-muted-foreground">
                        +{dayBookings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MonthView;
