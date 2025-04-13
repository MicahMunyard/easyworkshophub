
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

  // Create booking from extracted email data
  const createBookingFromEmailData = useCallback(async (
    email: EmailType
  ): Promise<Partial<BookingType> | null> => {
    if (!user || !email.extracted_details) return null;
    
    try {
      const details = email.extracted_details;
      
      // Process date to standardized format
      const bookingDate = parseEmailDate(details.date) || new Date().toISOString().split('T')[0];
      
      // Create booking object
      const newBooking: Partial<BookingType> = {
        customer: details.name || "Unknown Customer",
        phone: details.phone || "",
        service: details.service || "General Service",
        car: details.vehicle || "Not specified",
        time: details.time || "9:00 AM",
        duration: 60, // Default duration
        status: "pending",
        booking_date: bookingDate,
        notes: `Created from email: ${email.subject}\n\nOriginal email content:\n${email.content.replace(/<[^>]*>/g, '')}`,
        technician_id: null,
        service_id: null,
        bay_id: null,
        user_id: user.id
      };
      
      // Insert booking into database
      const { data, error } = await supabase
        .from('user_bookings')
        .insert(newBooking)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Mark the email as processed
      await supabase
        .from('processed_emails')
        .upsert({
          user_id: user.id,
          email_id: email.id,
          booking_created: true,
          processing_status: 'completed',
          processing_notes: `Booking created with ID: ${data.id}`,
          extracted_data: details,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email_id,user_id'
        });
      
      return data;
    } catch (error: any) {
      console.error("Error creating booking from email data:", error);
      
      // Mark processing as failed
      await supabase
        .from('processed_emails')
        .upsert({
          user_id: user.id,
          email_id: email.id,
          booking_created: false,
          processing_status: 'failed',
          processing_notes: error.message || 'Error creating booking',
          retry_count: supabase.rpc('increment_retry_count', { email_id_param: email.id }),
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
