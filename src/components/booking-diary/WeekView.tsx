
import React, { useMemo } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { BookingType } from "@/types/booking";

interface WeekViewProps {
  filteredBookings: BookingType[];
  handleBookingClick: (booking: BookingType) => void;
  timeSlots: string[];
  date: Date;
}

const WeekView: React.FC<WeekViewProps> = ({ 
  filteredBookings, 
  handleBookingClick, 
  timeSlots,
  date 
}) => {
  // Get the start of the week (Sunday) for the current date
  const weekStart = useMemo(() => startOfWeek(date), [date]);
  
  // Generate array of dates for the week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, index) => addDays(weekStart, index));
  }, [weekStart]);

  return (
    <div className="overflow-auto">
      <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] divide-x divide-border">
        {/* Time slots column */}
        <div className="sticky left-0 bg-background z-10">
          <div className="h-16 flex items-center justify-center border-b">
            <span className="text-xs text-muted-foreground">Time</span>
          </div>
          {timeSlots.map((time) => (
            <div key={time} className="h-16 p-2 text-xs text-muted-foreground flex items-center justify-center border-b">
              {time}
            </div>
          ))}
        </div>

        {/* Days of the week */}
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="min-w-[150px]">
            <div className="h-16 flex flex-col items-center justify-center border-b p-2 bg-muted/30 sticky top-0">
              <span className="text-xs font-medium">{format(day, "EEEE")}</span>
              <span className="text-xs text-muted-foreground">{format(day, "MMM d")}</span>
            </div>
            {timeSlots.map((time) => {
              // Find bookings for this day and time
              const dayBookings = filteredBookings.filter(booking => {
                const bookingDate = new Date(booking.date);
                return (
                  bookingDate.getDate() === day.getDate() &&
                  bookingDate.getMonth() === day.getMonth() &&
                  bookingDate.getFullYear() === day.getFullYear() &&
                  booking.time === time
                );
              });

              return (
                <div key={`${day.toISOString()}-${time}`} className="h-16 relative border-b hover:bg-muted/50 transition-colors">
                  {dayBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={cn(
                        "absolute left-1 right-1 p-2 rounded-md overflow-hidden text-xs cursor-pointer z-10",
                        "animate-slideRight transition-all hover:ring-1 hover:ring-ring",
                        booking.status === "confirmed"
                          ? "bg-workshop-blue/10 border-l-4 border-workshop-blue"
                          : "bg-amber-50 border-l-4 border-amber-400 dark:bg-amber-900/20"
                      )}
                      style={{
                        top: "4px",
                        height: `calc(${booking.duration / 30} * 4rem - 8px)`,
                      }}
                      onClick={() => handleBookingClick(booking)}
                    >
                      <div className="font-medium truncate">{booking.customer}</div>
                      <div className="text-xs flex gap-1 items-center text-muted-foreground truncate">
                        <span>{booking.service}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;
