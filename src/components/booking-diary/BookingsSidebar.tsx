
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Search, Users, CalendarIcon, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingsSidebarProps } from "./types";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const BookingsSidebar: React.FC<BookingsSidebarProps> = ({
  date,
  setDate,
  searchTerm,
  setSearchTerm,
  filteredBookings,
  handleBookingClick
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Function to get the appropriate color classes based on booking status
  const getStatusClasses = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-workshop-blue/20 text-workshop-blue dark:bg-workshop-blue/30 dark:text-blue-400";
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: // pending
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search appointments..."
              className="pl-8 h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {!user ? (
            <div className="border rounded-md p-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Sign in to view and manage your bookings
              </p>
              <Button 
                variant="default" 
                size="sm" 
                className="w-full"
                onClick={() => navigate("/auth/signin")}
              >
                <LogIn className="h-4 w-4 mr-2" /> Sign In
              </Button>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted px-3 py-2 text-xs font-medium">Today's Bookings</div>
              <div className="divide-y max-h-[300px] overflow-y-auto">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <div 
                      key={booking.id} 
                      className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleBookingClick(booking)}
                    >
                      <div className="font-medium flex justify-between">
                        <span>{booking.time}</span>
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded-full",
                          getStatusClasses(booking.status)
                        )}>
                          {booking.status === "confirmed" ? "Confirmed" : 
                           booking.status === "completed" ? "Completed" : 
                           booking.status === "cancelled" ? "Cancelled" : "Pending"}
                        </span>
                      </div>
                      <div className="text-sm">{booking.customer}</div>
                      <div className="text-xs text-muted-foreground flex gap-1 items-center mt-1">
                        <Users className="h-3 w-3" /> {booking.service}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No bookings found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingsSidebar;
