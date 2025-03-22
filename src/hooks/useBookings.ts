import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { BookingType } from "@/types/booking";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

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

export const useBookings = (initialDate = new Date(), initialView = "day") => {
  const [date, setDate] = useState<Date>(initialDate);
  const [view, setView] = useState(initialView);
  const [bookings, setBookings] = useState<BookingType[]>(dummyBookings);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const formattedDateString = format(date, 'yyyy-MM-dd');
      
      let startDate, endDate;
      
      if (view === 'day') {
        startDate = formattedDateString;
        endDate = formattedDateString;
      } else if (view === 'week') {
        const start = new Date(date);
        start.setDate(date.getDate() - date.getDay()); // Sunday
        const end = new Date(date);
        end.setDate(date.getDate() + (6 - date.getDay())); // Saturday
        
        startDate = format(start, 'yyyy-MM-dd');
        endDate = format(end, 'yyyy-MM-dd');
      } else if (view === 'month') {
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
        const transformedData: BookingType[] = data.map(booking => ({
          id: booking.id ? parseInt(booking.id.toString().replace(/-/g, '').substring(0, 8), 16) : Math.floor(Math.random() * 1000),
          customer: booking.customer_name,
          phone: booking.customer_phone,
          service: booking.service,
          time: booking.booking_time,
          duration: booking.duration,
          car: booking.car,
          status: (booking.status === 'confirmed' ? 'confirmed' : 'pending') as 'confirmed' | 'pending',
          date: booking.booking_date,
          technician_id: booking.technician_id,
          service_id: booking.service_id,
          bay_id: booking.bay_id
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
      // Load dummy data as fallback
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
    } finally {
      setIsLoading(false);
    }
  };

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

  const addBooking = async (newBooking: BookingType) => {
    try {
      const updatedBookings = [...bookings, newBooking];
      setBookings(updatedBookings);
      
      const bookingId = newBooking.id ? newBooking.id.toString() : uuidv4();
      
      const { error } = await supabase
        .from('bookings')
        .insert({
          id: bookingId,
          customer_name: newBooking.customer,
          customer_phone: newBooking.phone,
          service: newBooking.service,
          booking_time: newBooking.time,
          duration: newBooking.duration,
          car: newBooking.car,
          status: newBooking.status,
          booking_date: newBooking.date,
          technician_id: newBooking.technician_id || null,
          service_id: newBooking.service_id || null,
          bay_id: newBooking.bay_id || null
        });
      
      if (error) throw error;
      
      await supabase
        .from('jobs')
        .insert({
          id: uuidv4().substring(0, 8),
          customer: newBooking.customer,
          vehicle: newBooking.car,
          service: newBooking.service,
          status: newBooking.status === 'confirmed' ? 'pending' : 'pending',
          assigned_to: newBooking.technician_id || 'Unassigned',
          date: newBooking.date,
          time_estimate: `${newBooking.duration} minutes`,
          priority: 'Medium'
        })
        .single();
      
      toast({
        title: "Booking Created",
        description: `${newBooking.customer}'s booking has been added.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateBooking = async (updatedBooking: BookingType) => {
    try {
      const updatedBookings = bookings.map(booking => 
        booking.id === updatedBooking.id ? updatedBooking : booking
      );
      setBookings(updatedBookings);
      
      const bookingIdStr = updatedBooking.id.toString();
      
      const { error } = await supabase
        .from('bookings')
        .update({
          customer_name: updatedBooking.customer,
          customer_phone: updatedBooking.phone,
          service: updatedBooking.service,
          booking_time: updatedBooking.time,
          duration: updatedBooking.duration,
          car: updatedBooking.car,
          status: updatedBooking.status,
          booking_date: updatedBooking.date,
          technician_id: updatedBooking.technician_id || null,
          service_id: updatedBooking.service_id || null,
          bay_id: updatedBooking.bay_id || null
        })
        .eq('id', bookingIdStr);
      
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      const { data: matchingJobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('customer', updatedBooking.customer)
        .eq('date', updatedBooking.date);
      
      if (matchingJobs && matchingJobs.length > 0) {
        await supabase
          .from('jobs')
          .update({
            vehicle: updatedBooking.car,
            service: updatedBooking.service,
            status: updatedBooking.status === 'confirmed' ? 'pending' : 
                   updatedBooking.status === 'completed' ? 'completed' : 'pending',
            assigned_to: updatedBooking.technician_id || 'Unassigned',
            time_estimate: `${updatedBooking.duration} minutes`
          })
          .eq('id', matchingJobs[0].id);
      }
      
      toast({
        title: "Booking Updated",
        description: `${updatedBooking.customer}'s booking has been updated.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteBooking = async (bookingToDelete: BookingType) => {
    try {
      const updatedBookings = bookings.filter(booking => booking.id !== bookingToDelete.id);
      setBookings(updatedBookings);
      
      const bookingIdStr = bookingToDelete.id.toString();
      
      console.log("Deleting booking with ID:", bookingIdStr);
      
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingIdStr);
      
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      const { data: matchingJobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('customer', bookingToDelete.customer)
        .eq('date', bookingToDelete.date);
      
      if (matchingJobs && matchingJobs.length > 0) {
        await supabase
          .from('jobs')
          .delete()
          .eq('id', matchingJobs[0].id);
      }
      
      toast({
        title: "Booking Deleted",
        description: `${bookingToDelete.customer}'s booking has been deleted.`,
        variant: "destructive"
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast({
        title: "Error",
        description: "Failed to delete booking. Please try again.",
        variant: "destructive"
      });
      await fetchBookings();
      return false;
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [date, view]);

  return {
    date,
    setDate,
    view,
    setView,
    bookings,
    isLoading,
    navigateDate,
    addBooking,
    updateBooking,
    deleteBooking,
    fetchBookings
  };
};
