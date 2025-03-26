
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { EmailType } from "@/types/email";
import { BookingType } from "@/types/booking";
import { v4 as uuidv4 } from 'uuid';

export const useEmailIntegration = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [emails, setEmails] = useState<EmailType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<EmailType | null>(null);

  useEffect(() => {
    if (user) {
      fetchEmails();
    }
  }, [user]);

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      // This is a mock implementation - in a real app, we would fetch from the database
      // or integrate with an email API
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock email data
      const mockEmails: EmailType[] = [
        {
          id: "1",
          subject: "Booking Request for Oil Change",
          from: "John Smith",
          sender_email: "john.smith@example.com",
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          content: "<p>Hello,</p><p>I'd like to book an oil change for my Toyota Camry (2018) this Friday at 2pm if possible.</p><p>My phone number is 555-123-4567.</p><p>Thanks,<br>John</p>",
          is_booking_email: true,
          booking_created: false,
          extracted_details: {
            name: "John Smith",
            phone: "555-123-4567",
            date: "Friday",
            time: "2:00 PM",
            service: "Oil Change",
            vehicle: "Toyota Camry (2018)"
          }
        },
        {
          id: "2",
          subject: "Need appointment for brake inspection",
          from: "Sarah Johnson",
          sender_email: "sarah.j@example.com",
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          content: "<p>Hi there,</p><p>My car is making a squeaking noise when I brake. I think I need to get the brakes checked. Do you have any availability next Tuesday morning?</p><p>I drive a 2020 Honda Civic.</p><p>You can reach me at 555-987-6543.</p><p>Thanks,<br>Sarah</p>",
          is_booking_email: true,
          booking_created: false,
          extracted_details: {
            name: "Sarah Johnson",
            phone: "555-987-6543",
            date: "Next Tuesday",
            time: "Morning",
            service: "Brake Inspection",
            vehicle: "Honda Civic (2020)"
          }
        },
        {
          id: "3",
          subject: "Invoice #WS-2023-089",
          from: "AutoParts Supplier",
          sender_email: "invoices@autoparts.example.com",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          content: "<p>Dear Customer,</p><p>Please find attached the invoice #WS-2023-089 for your recent order.</p><p>Payment is due within 30 days.</p><p>Thank you for your business.</p>",
          is_booking_email: false,
          booking_created: false
        },
        {
          id: "4",
          subject: "Appointment for tire rotation",
          from: "Michael Brown",
          sender_email: "mbrown@example.com",
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          content: "<p>Hello,</p><p>I need to schedule a tire rotation for my Ford F-150. I'm available this coming Wednesday afternoon, preferably around 3pm.</p><p>My phone is 555-444-3333.</p><p>Best,<br>Michael</p>",
          is_booking_email: true,
          booking_created: true,
          extracted_details: {
            name: "Michael Brown",
            phone: "555-444-3333",
            date: "Wednesday",
            time: "3:00 PM",
            service: "Tire Rotation",
            vehicle: "Ford F-150"
          }
        }
      ];
      
      setEmails(mockEmails);
      
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast({
        title: "Error",
        description: "Failed to load emails. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshEmails = () => {
    fetchEmails();
  };

  const createBookingFromEmail = async (email: EmailType): Promise<boolean> => {
    if (!email.is_booking_email || email.booking_created || !email.extracted_details) {
      return false;
    }
    
    try {
      const details = email.extracted_details;
      
      // Create a new booking
      const newBooking: Partial<BookingType> = {
        customer: details.name || "Unknown Customer",
        phone: details.phone || "",
        service: details.service || "General Service",
        car: details.vehicle || "Not specified",
        time: details.time || "9:00 AM",
        duration: 60, // Default duration
        status: "pending",
        date: new Date().toISOString().split('T')[0], // Today's date as fallback
        notes: `Created from email: ${email.subject}`,
        technician_id: null,
        service_id: null,
        bay_id: null
      };
      
      // If date was extracted, try to parse it
      if (details.date) {
        // This is a simplified example - in a real app, you'd use more robust date parsing
        const dateMap: Record<string, string> = {
          "Monday": getNextWeekday(1),
          "Tuesday": getNextWeekday(2),
          "Wednesday": getNextWeekday(3),
          "Thursday": getNextWeekday(4),
          "Friday": getNextWeekday(5),
          "Saturday": getNextWeekday(6),
          "Sunday": getNextWeekday(0),
          "Tomorrow": getTomorrow(),
          "Today": getTodayDate()
        };
        
        newBooking.date = dateMap[details.date] || details.date;
      }
      
      // Mark the email as having created a booking
      const updatedEmails = emails.map(e => 
        e.id === email.id ? { ...e, booking_created: true } : e
      );
      
      setEmails(updatedEmails);
      
      if (selectedEmail && selectedEmail.id === email.id) {
        setSelectedEmail({ ...selectedEmail, booking_created: true });
      }
      
      // In a real implementation, we would save the booking to the database here
      console.log("Created booking from email:", newBooking);
      
      // Simulate database operation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Successfully created booking
      return true;
      
    } catch (error) {
      console.error("Error creating booking from email:", error);
      toast({
        title: "Error",
        description: "Failed to create booking from email",
        variant: "destructive"
      });
      return false;
    }
  };

  // Helper functions for date calculations
  const getNextWeekday = (dayIndex: number): string => {
    const today = new Date();
    const todayDay = today.getDay();
    const daysUntilNext = (dayIndex + 7 - todayDay) % 7;
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + (daysUntilNext === 0 ? 7 : daysUntilNext));
    return nextDate.toISOString().split('T')[0];
  };
  
  const getTomorrow = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  
  const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
  };
  
  return {
    emails,
    isLoading,
    selectedEmail,
    setSelectedEmail,
    refreshEmails,
    createBookingFromEmail
  };
};
