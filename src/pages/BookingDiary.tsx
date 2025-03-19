
import React, { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";

const timeSlots = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM"
];

// Sample data for initial development
const dummyBookings: BookingType[] = [
  { 
    id: 1, 
    customer: "John Smith", 
    phone: "(555) 123-4567", 
    service: "Oil Change", 
    time: "9:00 AM", 
    duration: 30, 
    car: "2018 Toyota Camry",
    status: "confirmed",
    date: format(new Date(), 'yyyy-MM-dd')
  },
  { 
    id: 2, 
    customer: "Sara Johnson", 
    phone: "(555) 234-5678", 
    service: "Brake Inspection", 
    time: "11:00 AM", 
    duration: 60,
    car: "2020 Honda Civic",
    status: "confirmed",
    date: format(new Date(), 'yyyy-MM-dd')
  },
  { 
    id: 3, 
    customer: "Mike Davis", 
    phone: "(555) 345-6789", 
    service: "Tire Rotation", 
    time: "1:30 PM", 
    duration: 45,
    car: "2019 Ford F-150",
    status: "pending",
    date: format(new Date(), 'yyyy-MM-dd')
  },
  { 
    id: 4, 
    customer: "Emma Wilson", 
    phone: "(555) 456-7890", 
    service: "Full Service", 
    time: "3:00 PM", 
    duration: 120,
    car: "2021 Tesla Model 3",
    status: "confirmed",
    date: format(new Date(), 'yyyy-MM-dd')
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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const formattedDate = format(date, "EEEE, MMMM d, yyyy");

  // Fetch bookings from Supabase
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const formattedDateString = format(date, 'yyyy-MM-dd');
        
        // Fetch bookings based on the view
        let startDate, endDate;
        
        if (view === 'day') {
          startDate = formattedDateString;
          endDate = formattedDateString;
        } else if (view === 'week') {
          // Get start and end of week
          const start = new Date(date);
          start.setDate(date.getDate() - date.getDay()); // Sunday
          const end = new Date(date);
          end.setDate(date.getDate() + (6 - date.getDay())); // Saturday
          
          startDate = format(start, 'yyyy-MM-dd');
          endDate = format(end, 'yyyy-MM-dd');
        } else if (view === 'month') {
          // Get start and end of month
          const start = new Date(date.getFullYear(), date.getMonth(), 1);
          const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          
          startDate = format(start, 'yyyy-MM-dd');
          endDate = format(end, 'yyyy-MM-dd');
        }

        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .gte('booking_date', startDate)
          .lte('booking_date', endDate);

        if (error) {
          throw error;
        }

        if (data) {
          // Transform data to match our BookingType interface
          const transformedData: BookingType[] = data.map(booking => ({
            id: booking.id ? parseInt(booking.id.toString().replace(/-/g, '').substring(0, 8), 16) : Math.floor(Math.random() * 1000),
            customer: booking.customer_name,
            phone: booking.customer_phone,
            service: booking.service,
            time: booking.booking_time,
            duration: booking.duration,
            car: booking.car,
            status: (booking.status === 'confirmed' ? 'confirmed' : 'pending') as 'confirmed' | 'pending',
            date: booking.booking_date
          }));
          
          setBookings(transformedData);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: "Error",
          description: "Failed to load bookings. Please try again.",
          variant: "destructive"
        });
        // Fall back to dummy data for development
        setBookings(dummyBookings);
      } finally {
        setIsLoading(false);
      }
    };

    // Comment out during development if needed
    // fetchBookings();
    
    // For development, simulate fetching data
    setTimeout(() => {
      // Add a booking with a different date for testing week and month views
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const extendedDummyBookings: BookingType[] = [
        ...dummyBookings,
        {
          id: 5,
          customer: "Alex Brown",
          phone: "(555) 567-8901",
          service: "Wheel Alignment",
          time: "10:00 AM",
          duration: 60,
          car: "2022 Ford Mustang",
          status: "confirmed",
          date: format(tomorrow, 'yyyy-MM-dd')
        },
        {
          id: 6,
          customer: "Linda Green",
          phone: "(555) 678-9012",
          service: "Battery Replacement",
          time: "2:00 PM",
          duration: 30,
          car: "2019 Chevrolet Equinox",
          status: "pending",
          date: format(nextWeek, 'yyyy-MM-dd')
        }
      ];
      
      setBookings(extendedDummyBookings);
      setIsLoading(false);
    }, 500);
  }, [date, view]);

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

  const handleSaveBooking = async (updatedBooking: BookingType) => {
    try {
      // First update our local state
      const updatedBookings = bookings.map(booking => 
        booking.id === updatedBooking.id ? updatedBooking : booking
      );
      setBookings(updatedBookings);
      
      // Save to Supabase (commented out during development)
      // const { error } = await supabase
      //   .from('bookings')
      //   .update({
      //     customer_name: updatedBooking.customer,
      //     customer_phone: updatedBooking.phone,
      //     service: updatedBooking.service,
      //     booking_time: updatedBooking.time,
      //     duration: updatedBooking.duration,
      //     car: updatedBooking.car,
      //     status: updatedBooking.status,
      //     // Additional fields like mechanic, notes, cost would be included here in a real application
      //   })
      //   .eq('id', updatedBooking.id);
      
      // if (error) throw error;
      
      setIsModalOpen(false);
      setSelectedBooking(null);
      
      toast({
        title: "Booking Updated",
        description: `${updatedBooking.customer}'s booking has been updated.`,
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddNewBooking = async (newBooking: BookingType) => {
    try {
      // Add to local state first
      setBookings([...bookings, newBooking]);
      
      // Save to Supabase (commented out during development)
      // const { error } = await supabase
      //   .from('bookings')
      //   .insert({
      //     customer_name: newBooking.customer,
      //     customer_phone: newBooking.phone,
      //     service: newBooking.service,
      //     booking_time: newBooking.time,
      //     duration: newBooking.duration,
      //     car: newBooking.car,
      //     status: newBooking.status,
      //     booking_date: newBooking.date
      //     // Additional fields like mechanic, notes, cost would be included here in a real application
      //   });
      
      // if (error) throw error;
      
      setIsNewBookingModalOpen(false);
      
      toast({
        title: "Booking Created",
        description: `${newBooking.customer}'s booking has been added.`,
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    }
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
