import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getEdgeFunctionUrl } from "./utils/supabaseUtils";

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
    try {
      const { data, error } = await supabase
        .from('email_connections')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error) {
        console.error("Error checking email connection:", error);
        setIsConnected(false);
        return false;
      }
      
      setIsConnected(!!data);
      return !!data;
    } catch (error) {
      console.error("Error checking email connection:", error);
      setIsConnected(false);
      return false;
    }
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
      // Get the user's session token for authorization
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session found");
      }
      
      const response = await fetch(getEdgeFunctionUrl('email-integration/connect'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          provider,
          email: emailAddress,
          password, // In production, use proper encryption and secure handling
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to connect email account");
      }
      
      setPassword(""); // Clear password for security
      setIsConnected(true);
      
      toast({
        title: "Success",
        description: "Email account connected successfully",
      });
      
      return true;
      
    } catch (error) {
      console.error("Error connecting email:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to email account. Please try again.",
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
      
      // Get the user's session token for authorization
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session found");
      }
      
      const response = await fetch(getEdgeFunctionUrl('email-integration/disconnect'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to disconnect email account");
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
        description: error.message || "Failed to disconnect email account",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async () => {
    if (!isConnected) {
      return false;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('email_connections')
        .update({
          auto_create_bookings: autoCreateBookings,
        })
        .eq('user_id', user?.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Settings Updated",
        description: "Your email settings have been updated"
      });
      
      return true;
      
    } catch (error) {
      console.error("Error updating email settings:", error);
      toast({
        title: "Error",
        description: "Failed to update email settings",
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
    updateSettings,
    checkConnection
  };
};
