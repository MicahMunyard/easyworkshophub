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
        
        const transformedData: BookingType[] = data.map(booking => ({
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

  useEffect(() => {
    console.log("Setting up real-time subscription for bookings");
    
    if (!user) {
      setBookings([]);
      return;
    }
    
    fetchBookings();
    
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
