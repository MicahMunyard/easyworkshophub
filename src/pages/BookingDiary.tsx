
import React from "react";
import BookingDiaryHeader from "@/components/booking-diary/BookingDiaryHeader";
import BookingFilter from "@/components/booking-diary/BookingFilter";
import BookingsSidebar from "@/components/booking-diary/BookingsSidebar";
import BookingContent from "@/components/booking-diary/BookingContent";
import BookingModals from "@/components/booking-diary/BookingModals";
import { useBookingDiaryState } from "@/hooks/bookings/useBookingDiaryState";
import { useIsMobile } from "@/hooks/use-mobile";

const timeSlots = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM"
];

const BookingDiary = () => {
  const {
    date,
    setDate,
    view,
    setView,
    isLoading,
    navigateDate,
    selectedBooking,
    isModalOpen,
    isNewBookingModalOpen,
    setIsNewBookingModalOpen,
    searchTerm,
    setSearchTerm,
    isFilterOpen,
    setIsFilterOpen,
    filteredBookings,
    handleBookingClick,
    handleCloseModal,
    handleSaveBooking,
    handleAddNewBooking,
    handleDeleteBooking
  } = useBookingDiaryState();
  
  const isMobile = useIsMobile();

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

      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4`}>
        <div className={isMobile ? 'w-full' : 'md:w-64'}>
          <BookingsSidebar 
            date={date}
            setDate={setDate}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredBookings={filteredBookings}
            handleBookingClick={handleBookingClick}
          />
        </div>

        <BookingContent 
          date={date}
          view={view}
          setView={setView}
          navigateDate={navigateDate}
          isLoading={isLoading}
          filteredBookings={filteredBookings}
          handleBookingClick={handleBookingClick}
          timeSlots={timeSlots}
        />
      </div>
      
      <BookingModals 
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        selectedBooking={selectedBooking}
        handleSaveBooking={handleSaveBooking}
        handleDeleteBooking={handleDeleteBooking}
        isNewBookingModalOpen={isNewBookingModalOpen}
        setIsNewBookingModalOpen={setIsNewBookingModalOpen}
        handleAddNewBooking={handleAddNewBooking}
      />
    </div>
  );
};

export default BookingDiary;
