
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import BookingModal from "@/components/BookingModal";
import NewBookingModal from "@/components/NewBookingModal";
import { BookingType } from "@/types/booking";
import CalendarNavigation from "@/components/booking-diary/CalendarNavigation";
import BookingsSidebar from "@/components/booking-diary/BookingsSidebar";
import BookingView from "@/components/booking-diary/BookingView";
import BookingDiaryHeader from "@/components/booking-diary/BookingDiaryHeader";
import BookingFilter from "@/components/booking-diary/BookingFilter";
import { useBookings } from "@/hooks/useBookings";
import { BookingView as BookingViewType } from "@/hooks/bookings/types";
import { useToast } from "@/hooks/use-toast";

const timeSlots = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM"
];

const BookingDiary = () => {
  const { toast } = useToast();
  const { 
    date, 
    setDate, 
    view, 
    setView, 
    bookings, 
    isLoading, 
    navigateDate, 
    addBooking, 
    updateBooking, 
    deleteBooking 
  } = useBookings();
  
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const formattedDate = format(date, "EEEE, MMMM d, yyyy");

  const handleBookingClick = (booking: BookingType) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!isDeleting) {
      setIsModalOpen(false);
      setSelectedBooking(null);
    }
  };

  const handleSaveBooking = async (updatedBooking: BookingType) => {
    try {
      const success = await updateBooking(updatedBooking);
      if (success) {
        setIsModalOpen(false);
        setSelectedBooking(null);
        toast({
          title: "Booking Updated",
          description: `${updatedBooking.customer}'s booking has been updated.`,
        });
      }
    } catch (error) {
      console.error("Error saving booking:", error);
      toast({
        title: "Error",
        description: "Failed to update booking. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddNewBooking = async (newBooking: BookingType) => {
    try {
      const success = await addBooking(newBooking);
      if (success) {
        setIsNewBookingModalOpen(false);
        toast({
          title: "Booking Created",
          description: `${newBooking.customer}'s booking has been added.`,
        });
      }
    } catch (error) {
      console.error("Error adding booking:", error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBooking = async (bookingToDelete: BookingType): Promise<boolean> => {
    try {
      setIsDeleting(true);
      console.log("Attempting to delete booking in BookingDiary:", bookingToDelete);
      const success = await deleteBooking(bookingToDelete);
      
      if (success) {
        // This will be handled in the BookingModal component
        return true;
      } else {
        throw new Error("Delete operation failed");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast({
        title: "Error",
        description: "Failed to delete booking. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsDeleting(false);
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
      <BookingDiaryHeader 
        onNewBookingClick={() => setIsNewBookingModalOpen(true)}
        onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
        isFilterOpen={isFilterOpen}
      />

      {isFilterOpen && (
        <BookingFilter 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
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
      
      <BookingModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        booking={selectedBooking}
        onSave={handleSaveBooking}
        onDelete={handleDeleteBooking}
      />

      <NewBookingModal
        isOpen={isNewBookingModalOpen}
        onClose={() => setIsNewBookingModalOpen(false)}
        onSave={handleAddNewBooking}
      />
    </div>
  );
};

export default BookingDiary;
