
import React, { useState } from "react";
import { Plus, Filter, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import BookingModal from "@/components/BookingModal";
import NewBookingModal from "@/components/NewBookingModal";
import { BookingType } from "@/types/booking";
import CalendarNavigation from "@/components/booking-diary/CalendarNavigation";
import BookingsSidebar from "@/components/booking-diary/BookingsSidebar";
import BookingView from "@/components/booking-diary/BookingView";
import { Search } from "lucide-react";

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
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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

  const handleAddNewBooking = (newBooking: BookingType) => {
    setBookings([...bookings, newBooking]);
    setIsNewBookingModalOpen(false);
    
    toast({
      title: "Booking Created",
      description: `${newBooking.customer}'s booking has been added.`,
    });
  };

  const filteredBookings = bookings.filter(booking => 
    booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.car.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.phone.includes(searchTerm)
  );

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
          <Button 
            variant="outline" 
            className="h-9"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
          <Button 
            className="h-9"
            onClick={() => setIsNewBookingModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> New Booking
          </Button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="bg-muted/30 p-4 rounded-md border animate-fadeIn">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by customer, car, service, or phone..."
              className="flex-1 bg-transparent border-none outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-64">
          <BookingsSidebar 
            date={date}
            setDate={setDate}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredBookings={filteredBookings}
            handleBookingClick={handleBookingClick}
          />
        </div>

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
              <BookingView
                view={view}
                filteredBookings={filteredBookings}
                handleBookingClick={handleBookingClick}
                timeSlots={timeSlots}
              />
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

      {/* Modal for adding new bookings */}
      <NewBookingModal
        isOpen={isNewBookingModalOpen}
        onClose={() => setIsNewBookingModalOpen(false)}
        onSave={handleAddNewBooking}
      />
    </div>
  );
};

export default BookingDiary;
