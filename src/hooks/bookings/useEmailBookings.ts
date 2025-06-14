
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
      
      // Instead of using Partial<BookingType>, use a database-compatible structure
      // with the correct field names that Supabase expects
      const dbBooking = {
        customer_name: details.name || "Unknown Customer",
        customer_phone: details.phone || "",
        service: details.service || "General Service",
        car: details.vehicle || "Not specified",
        booking_time: details.time || "9:00 AM",
        duration: 60,
        status: "pending" as "pending" | "confirmed" | "cancelled" | "completed", // Explicitly type to match allowed values
        booking_date: bookingDate,
        notes: `Created from email: ${email.subject}\n\nOriginal email content:\n${email.content.replace(/<[^>]*>/g, '')}`,
        technician_id: null,
        service_id: null,
        bay_id: null,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('user_bookings')
        .insert(dbBooking)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Convert ExtractedDetails to a plain object that's compatible with JSON
      // to resolve the type error with Supabase's expected Json type
      const extractedDataForDb = details ? {
        name: details.name,
        phone: details.phone,
        date: details.date,
        time: details.time,
        service: details.service,
        vehicle: details.vehicle
      } : null;
      
      await supabase
        .from('processed_emails')
        .upsert({
          user_id: user.id,
          email_id: email.id,
          booking_created: true,
          processing_status: 'completed' as const,
          processing_notes: `Booking created with ID: ${data.id}`,
          extracted_data: extractedDataForDb,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email_id,user_id'
        });
      
      // Convert the database booking to the BookingType format for the frontend
      const bookingData: Partial<BookingType> = {
        id: data.id,
        customer: data.customer_name,
        phone: data.customer_phone,
        service: data.service,
        car: data.car,
        time: data.booking_time,
        duration: data.duration,
        status: data.status as BookingType["status"], // Ensure type safety
        date: data.booking_date,
        notes: data.notes,
        technician_id: data.technician_id,
        service_id: data.service_id,
        bay_id: data.bay_id
      };
      
      return bookingData;
    } catch (error: any) {
      console.error("Error creating booking from email data:", error);
      
      // Also use a plain object for this error case
      const extractedDataForError = email.extracted_details ? {
        name: email.extracted_details.name,
        phone: email.extracted_details.phone,
        date: email.extracted_details.date,
        time: email.extracted_details.time,
        service: email.extracted_details.service,
        vehicle: email.extracted_details.vehicle
      } : null;
      
      await supabase
        .from('processed_emails')
        .upsert({
          user_id: user.id,
          email_id: email.id,
          booking_created: false,
          processing_status: 'failed' as const,
          processing_notes: error.message || 'Error creating booking',
          retry_count: 0,
          extracted_data: extractedDataForError,
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
