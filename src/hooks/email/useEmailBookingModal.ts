import { EmailType } from "@/types/email";
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useEmailBookingModal = () => {
  const { user } = useAuth();

  const prepareBookingDataFromEmail = (email: EmailType): Partial<BookingType> => {
    const extractedDetails = email.extracted_details || {
      name: null,
      phone: null,
      date: null,
      time: null,
      service: null,
      vehicle: null
    };

    const bookingData: Partial<BookingType> = {
      customer: extractedDetails.name || "",
      phone: extractedDetails.phone || "",
      car: extractedDetails.vehicle || "",
      service: extractedDetails.service || "",
      time: extractedDetails.time || "9:00 AM",
      date: extractedDetails.date || new Date().toISOString().split('T')[0],
      notes: `Created from email: ${email.subject}\nFrom: ${email.from} (${email.sender_email})`,
      status: "pending"
    };

    return bookingData;
  };

  const markEmailAsProcessed = async (emailId: string, bookingId: number | string) => {
    if (!user) return;

    try {
      await supabase
        .from('processed_emails')
        .upsert({
          user_id: user.id,
          email_id: emailId,
          booking_created: true,
          processing_status: 'completed' as const,
          processing_notes: `Booking created with ID: ${bookingId}`,
          extracted_data: null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email_id,user_id'
        });
    } catch (error) {
      console.error("Error marking email as processed:", error);
    }
  };

  return {
    prepareBookingDataFromEmail,
    markEmailAsProcessed
  };
};
