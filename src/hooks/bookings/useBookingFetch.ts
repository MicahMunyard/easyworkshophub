import { useState, useEffect } from "react";
import { format } from "date-fns";
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookingView } from "./types";
import { useAuth } from "@/contexts/AuthContext";

export const useBookingFetch = (date: Date, view: BookingView) => {
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        // If no user is logged in, return empty bookings
        setBookings([]);
        setIsLoading(false);
        return;
      }

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

      console.log(`Fetching bookings from ${startDate} to ${endDate} for user ${user.id}`);
      
      // Query user_bookings table instead of bookings table
      const { data, error } = await supabase
        .from('user_bookings')
        .select('*')
        .eq('user_id', user.id)
        .gte('booking_date', startDate)
        .lte('booking_date', endDate);

      if (error) {
        throw error;
      }

      if (data) {
        console.log(`Fetched ${data.length} bookings for user ${user.id}:`, data);
        
        // IMPORTANT: Keep the ID in its original format for Supabase operations
        const transformedData: BookingType[] = data.map(booking => ({
          // Use the original ID as is (as a string) - this is the key fix
          id: booking.id,
          customer: booking.customer_name,
          phone: booking.customer_phone,
          email: booking.customer_email,
          service: booking.service,
          time: booking.booking_time,
          duration: booking.duration,
          car: booking.car,
          status: (booking.status === 'confirmed' ? 'confirmed' : 
                 booking.status === 'completed' ? 'completed' : 
                 booking.status === 'cancelled' ? 'cancelled' : 'pending') as 'confirmed' | 'pending' | 'cancelled' | 'completed',
          date: booking.booking_date,
          notes: booking.notes,
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
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription to booking changes
  useEffect(() => {
    console.log("Setting up real-time subscription for bookings");
    
    if (!user) {
      // Don't attempt to fetch or subscribe if no user is logged in
      setBookings([]);
      return;
    }
    
    fetchBookings();
    
    // Subscribe to booking changes for the current user
    const bookingsChannel = supabase
      .channel('user-bookings-changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'user_bookings',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log("User booking change detected:", payload);
          fetchBookings();
        }
      )
      .subscribe((status) => {
        console.log("User bookings subscription status:", status);
      });
    
    // Clean up subscription
    return () => {
      console.log("Cleaning up bookings subscription");
      supabase.removeChannel(bookingsChannel);
    };
  }, [date, view, user]);

  return {
    bookings,
    setBookings,
    isLoading,
    fetchBookings
  };
};
