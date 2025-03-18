
import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Search,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import BookingModal from "@/components/BookingModal";
import { BookingType } from "@/types/booking";

const timeSlots = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM"
];

const dummyBookings: BookingType[] = [
  { 
    id: 1, 
    customer: "John Smith", 
    phone: "(555) 123-4567", 
    service: "Oil Change", 
    time: "9:00 AM", 
    duration: 30, 
    car: "2018 Toyota Camry",
    status: "confirmed" 
  },
  { 
    id: 2, 
    customer: "Sara Johnson", 
    phone: "(555) 234-5678", 
    service: "Brake Inspection", 
    time: "11:00 AM", 
    duration: 60,
    car: "2020 Honda Civic",
    status: "confirmed" 
  },
  { 
    id: 3, 
    customer: "Mike Davis", 
    phone: "(555) 345-6789", 
    service: "Tire Rotation", 
    time: "1:30 PM", 
    duration: 45,
    car: "2019 Ford F-150",
    status: "pending" 
  },
  { 
    id: 4, 
    customer: "Emma Wilson", 
    phone: "(555) 456-7890", 
    service: "Full Service", 
    time: "3:00 PM", 
    duration: 120,
    car: "2021 Tesla Model 3",
    status: "confirmed" 
  }
];

const BookingDiary = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState("day");
  const [bookings, setBookings] = useState<BookingType[]>(dummyBookings);
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  
  const formattedDate = format(date, "EEEE, MMMM d, yyyy");

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(date);
    if (view === "day") {
      newDate.setDate(date.getDate() + (direction === "next" ? 1 : -1));
    } else if (view === "week") {
      newDate.setDate(date.getDate() + (direction === "next" ? 7 : -7));
    } else if (view === "month") {
      newDate.setMonth(date.getMonth() + (direction === "next" ? 1 : -1));
    }
    setDate(newDate);
  };

  const handleBookingClick = (booking: BookingType) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleSaveBooking = (updatedBooking: BookingType) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === updatedBooking.id ? updatedBooking : booking
    );
    setBookings(updatedBookings);
    setIsModalOpen(false);
    setSelectedBooking(null);
    
    toast({
      title: "Booking Updated",
      description: `${updatedBooking.customer}'s booking has been updated.`,
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Diary</h1>
          <p className="text-muted-foreground">
            Manage appointments and schedule services
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
          <Button className="h-9">
            <Plus className="h-4 w-4 mr-2" /> New Booking
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-64">
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
                  />
                </div>

                <div className="border rounded-md overflow-hidden">
                  <div className="bg-muted px-3 py-2 text-xs font-medium">Today's Bookings</div>
                  <div className="divide-y max-h-[300px] overflow-y-auto">
                    {bookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleBookingClick(booking)}
                      >
                        <div className="font-medium flex justify-between">
                          <span>{booking.time}</span>
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded-full",
                            booking.status === "confirmed" 
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          )}>
                            {booking.status === "confirmed" ? "Confirmed" : "Pending"}
                          </span>
                        </div>
                        <div className="text-sm">{booking.customer}</div>
                        <div className="text-xs text-muted-foreground flex gap-1 items-center mt-1">
                          <Users className="h-3 w-3" /> {booking.service}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <Card className="overflow-hidden">
            <CardHeader className="p-4 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateDate("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle>{formattedDate}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateDate("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Tabs defaultValue="day" onValueChange={setView as any}>
                  <TabsList>
                    <TabsTrigger value="day">Day</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-4 overflow-auto">
              <div className="min-w-[600px]">
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
                        {bookings
                          .filter((booking) => booking.time === time)
                          .map((booking) => (
                            <div
                              key={booking.id}
                              className={cn(
                                "absolute left-1 right-1 p-2 rounded-md overflow-hidden text-sm cursor-pointer",
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
                                <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground"></span>
                                <span>{booking.car}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modal for editing bookings */}
      <BookingModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        booking={selectedBooking}
        onSave={handleSaveBooking}
      />
    </div>
  );
};

export default BookingDiary;
