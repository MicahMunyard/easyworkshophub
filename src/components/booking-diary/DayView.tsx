
import React from "react";
import { cn } from "@/lib/utils";
import { DayViewProps } from "./types";
import { Users } from "lucide-react";

const DayView: React.FC<DayViewProps> = ({ 
  filteredBookings, 
  handleBookingClick, 
  timeSlots 
}) => {
  // Function to get the appropriate color classes based on booking status
  const getStatusClasses = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-workshop-blue/10 border-l-4 border-workshop-blue";
      case "completed":
        return "bg-green-50 border-l-4 border-green-500 dark:bg-green-900/20";
      case "cancelled":
        return "bg-red-50 border-l-4 border-red-500 dark:bg-red-900/20";
      default: // pending
        return "bg-amber-50 border-l-4 border-amber-400 dark:bg-amber-900/20";
    }
  };

  return (
    <div className="grid grid-cols-[80px_1fr] divide-x divide-border">
      <div className="divide-y">
        {timeSlots.map((time) => (
          <div key={time} className="h-16 p-2 text-xs text-muted-foreground">
            {time}
          </div>
        ))}
      </div>
      <div className="relative divide-y">
        {timeSlots.map((time) => (
          <div key={time} className="h-16 p-1 relative hover:bg-muted/50 transition-colors">
            {filteredBookings
              .filter((booking) => booking.time === time)
              .map((booking) => (
                <div
                  key={booking.id}
                  className={cn(
                    "absolute left-1 right-1 p-2 rounded-md overflow-hidden text-sm cursor-pointer",
                    "animate-slideRight transition-all hover:ring-1 hover:ring-ring",
                    getStatusClasses(booking.status)
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
                    <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground"></span>
                    <span>{booking.car}</span>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayView;
