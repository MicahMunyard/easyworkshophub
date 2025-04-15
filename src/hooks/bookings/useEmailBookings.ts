
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { EmailType } from "@/types/email";
import { BookingType } from "@/types/booking";
import { parseEmailDate } from "../email/utils/dateUtils";

export const useEmailBookings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const createBookingFromEmailData = useCallback(async (
    email: EmailType
  ): Promise<Partial<BookingType> | null> => {
    if (!user || !email.extracted_details) return null;
    
    try {
      const details = email.extracted_details;
      
      const bookingDate = parseEmailDate(details.date) || new Date().toISOString().split('T')[0];
      
      // Define booking with explicit status type to match BookingType
      const newBooking: Partial<BookingType> = {
        customer_name: details.name || "Unknown Customer",
        customer_phone: details.phone || "",
        service: details.service || "General Service",
        car: details.vehicle || "Not specified",
        booking_time: details.time || "9:00 AM",
        duration: 60,
        status: "pending" as "pending" | "confirmed" | "cancelled" | "completed", // Explicitly type to match BookingType
        booking_date: bookingDate,
        notes: `Created from email: ${email.subject}\n\nOriginal email content:\n${email.content.replace(/<[^>]*>/g, '')}`,
        technician_id: null,
        service_id: null,
        bay_id: null,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('user_bookings')
        .insert(newBooking)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      await supabase
        .from('processed_emails')
        .upsert({
          user_id: user.id,
          email_id: email.id,
          booking_created: true,
          processing_status: 'completed' as const,
          processing_notes: `Booking created with ID: ${data.id}`,
          extracted_data: details,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email_id,user_id'
        });
      
      return data;
    } catch (error: any) {
      console.error("Error creating booking from email data:", error);
      
      await supabase
        .from('processed_emails')
        .upsert({
          user_id: user.id,
          email_id: email.id,
          booking_created: false,
          processing_status: 'failed' as const,
          processing_notes: error.message || 'Error creating booking',
          retry_count: 0,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email_id,user_id'
        });
      
      return null;
    }
  }, [user]);

  return {
    isProcessing,
    createBookingFromEmailData
  };
};
