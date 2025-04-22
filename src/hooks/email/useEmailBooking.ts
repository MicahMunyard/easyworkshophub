
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { EmailType } from "@/types/email";
import { supabase } from "@/integrations/supabase/client";
import { getEdgeFunctionUrl } from "./utils/supabaseUtils";

export const useEmailBooking = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [processingEmailId, setProcessingEmailId] = useState<string | null>(null);

  const createBookingFromEmail = async (email: EmailType): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setProcessingEmailId(email.id);
      
      await supabase
        .from('processed_emails')
        .upsert({
          user_id: user.id,
          email_id: email.id,
          booking_created: false,
          processing_status: 'processing' as const,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email_id,user_id'
        });
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session found");
      }
      
      const response = await fetch(getEdgeFunctionUrl('email-integration'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          action: 'create-booking',
          emailId: email.id,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create booking");
      }
      
      const result = await response.json();
      
      if (result.success) {
        await supabase
          .from('processed_emails')
          .upsert({
            user_id: user.id,
            email_id: email.id,
            booking_created: true,
            processing_status: 'completed' as const,
            processing_notes: `Booking created with ID: ${result.bookingId || 'unknown'}`,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'email_id,user_id'
          });
        
        toast({
          title: "Success",
          description: "Booking created successfully from email"
        });
        
        return true;
      }
      
      throw new Error(result.error || "Failed to create booking from email");
      
    } catch (error: any) {
      console.error("Error creating booking from email:", error);
      
      if (user) {
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
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to create booking from email",
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessingEmailId(null);
    }
  };

  return {
    processingEmailId,
    createBookingFromEmail
  };
};
