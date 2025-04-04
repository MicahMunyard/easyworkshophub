
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

  // Calculate position for side-by-side display of bookings in the same time slot
  const getPositionStyles = (bookings: any[], index: number) => {
    const totalBookings = bookings.length;
    
    // If only one booking, use full width
    if (totalBookings === 1) {
      return { 
        left: "1px", 
        right: "1px", 
        width: "calc(100% - 2px)" 
      };
    }
    
    // For multiple bookings, split the width evenly
    const widthPercentage = 100 / totalBookings;
    const width = `calc(${widthPercentage}% - 4px)`;
    const leftPosition = `calc(${index * widthPercentage}% + 2px)`;
    
    return {
      width,
      left: leftPosition,
      right: "auto",
    };
  };

  return (
    <div className="grid grid-cols-[80px_1fr] divide-x divide-border">
      {/* Time slots column */}
      <div className="divide-y">
        {timeSlots.map((time) => (
          <div key={time} className="h-16 p-2 text-xs text-muted-foreground">
            {time}
          </div>
        ))}
      </div>
      
      {/* Bookings column */}
      <div className="relative divide-y">
        {timeSlots.map((time) => {
          // Get all bookings for this time slot
          const timeBookings = filteredBookings.filter(booking => booking.time === time);
          
          return (
            <div key={time} className="h-16 p-1 relative hover:bg-muted/50 transition-colors">
              {timeBookings.map((booking, index) => {
                // Get position for side-by-side display
                const positionStyles = getPositionStyles(timeBookings, index);
                
                return (
                  <div
                    key={booking.id}
                    className={cn(
                      "absolute p-2 rounded-md overflow-hidden text-sm cursor-pointer",
                      "animate-slideRight transition-all hover:ring-1 hover:ring-ring",
                      getStatusClasses(booking.status)
                    )}
                    style={{
                      top: "4px",
                      height: `calc(${booking.duration / 30} * 4rem - 8px)`,
                      ...positionStyles,
                      // Ensure higher index bookings are on top but all bookings are above the grid
                      zIndex: 10 + index
                    }}
                    onClick={() => handleBookingClick(booking)}
                  >
                    <div className="font-medium truncate">{booking.customer}</div>
                    <div className="text-xs flex gap-1 items-center text-muted-foreground truncate">
                      <span>{booking.service}</span>
                      <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground"></span>
                      <span>{booking.car}</span>
                    </div>
                    
                    {/* Show indicator if multiple bookings in this time slot */}
                    {timeBookings.length > 1 && (
                      <div className="absolute top-1 right-1 flex items-center justify-center">
                        <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayView;
