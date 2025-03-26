
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { checkEmailConnection } from "./services/emailService";

export const useEmailConnection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [provider, setProvider] = useState("gmail");
  const [autoCreateBookings, setAutoCreateBookings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      checkConnection();
      if (isConnected) {
        fetchEmailSettings();
      }
    }
  }, [user, isConnected]);

  const checkConnection = async () => {
    const connected = await checkEmailConnection(user?.id);
    setIsConnected(connected);
    return connected;
  };

  const fetchEmailSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_connections')
        .select('email_address, provider, auto_create_bookings')
        .eq('user_id', user?.id)
        .single();
      
      if (error) {
        console.error("Error fetching email settings:", error);
        return;
      }
      
      if (data) {
        setEmailAddress(data.email_address);
        setProvider(data.provider);
        setAutoCreateBookings(data.auto_create_bookings);
      }
    } catch (error) {
      console.error("Error fetching email settings:", error);
    }
  };

  const connectEmail = async () => {
    if (!emailAddress || !password) {
      toast({
        title: "Missing Information",
        description: "Please provide email address and password",
        variant: "destructive"
      });
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Note: In a real implementation, we'd use OAuth or a secure way to handle email credentials
      // This is just a mockup of what the UX would look like
      
      // Simulating connection process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { error } = await supabase
        .from('email_connections')
        .upsert({
          user_id: user?.id,
          email_address: emailAddress,
          provider: provider,
          auto_create_bookings: autoCreateBookings,
          connected_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      setPassword(""); // Clear password for security
      setIsConnected(true);
      return true;
      
    } catch (error) {
      console.error("Error connecting email:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to email account. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectEmail = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('email_connections')
        .delete()
        .eq('user_id', user?.id);
      
      if (error) {
        throw error;
      }
      
      setEmailAddress("");
      setPassword("");
      setProvider("gmail");
      setAutoCreateBookings(false);
      setIsConnected(false);
      
      toast({
        title: "Email Disconnected",
        description: "Your email account has been disconnected"
      });
      
      return true;
      
    } catch (error) {
      console.error("Error disconnecting email:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect email account",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isConnected,
    emailAddress,
    setEmailAddress,
    password,
    setPassword,
    provider,
    setProvider,
    autoCreateBookings,
    setAutoCreateBookings,
    isLoading,
    connectEmail,
    disconnectEmail,
    checkConnection
  };
};
