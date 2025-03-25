
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { AppointmentData } from "./types";

export const useAppointmentsFetch = () => {
  const fetchTodayAppointments = async (userId: string): Promise<AppointmentData[]> => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Fetch today's bookings from user_bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('user_bookings')
        .select('*')
        .eq('booking_date', today)
        .eq('user_id', userId);
        
      if (bookingsError) throw bookingsError;
      
      return bookingsData || [];
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  };

  const formatAppointments = (appointments: AppointmentData[]) => {
    return appointments.map(appointment => ({
      id: appointment.id,
      time: appointment.booking_time,
      customer: appointment.customer_name,
      service: appointment.service,
      car: appointment.car,
      status: appointment.status || 'pending',
      date: appointment.booking_date,
      duration: appointment.duration
    }));
  };

  return {
    fetchTodayAppointments,
    formatAppointments
  };
};
