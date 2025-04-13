
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getEdgeFunctionUrl } from "./utils/supabaseUtils";
import { EmailConnectionConfig } from "@/types/email";

export const useEmailConnection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [provider, setProvider] = useState("gmail");
  const [autoCreateBookings, setAutoCreateBookings] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [lastError, setLastError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      checkConnection();
    }
  }, [user]);

  const checkConnection = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('email_connections')
        .select('email_address, provider, auto_create_bookings, status, last_error')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error("Error checking email connection:", error);
        setIsConnected(false);
        return false;
      }
      
      if (data) {
        setEmailAddress(data.email_address);
        setProvider(data.provider);
        setAutoCreateBookings(data.auto_create_bookings);
        setConnectionStatus(data.status || 'disconnected');
        setLastError(data.last_error);
        setIsConnected(data.status === 'connected');
        return data.status === 'connected';
      }
      
      setIsConnected(false);
      return false;
    } catch (error) {
      console.error("Error checking email connection:", error);
      setIsConnected(false);
      return false;
    }
  };

  const connectEmail = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to connect your email account",
        variant: "destructive"
      });
      return false;
    }
    
    if (!emailAddress || !password) {
      toast({
        title: "Missing Information",
        description: "Please provide email address and password",
        variant: "destructive"
      });
      return false;
    }
    
    setIsLoading(true);
    setIsConnecting(true);
    
    try {
      // Update status in database first
      await supabase
        .from('email_connections')
        .upsert({
          user_id: user.id,
          email_address: emailAddress,
          provider: provider,
          auto_create_bookings: autoCreateBookings,
          status: 'connecting',
          last_error: null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      // Get the user's session token for authorization
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session found");
      }
      
      const response = await fetch(`${getEdgeFunctionUrl('email-integration')}/connect`, {
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
        // Update database with error
        await supabase
          .from('email_connections')
          .update({
            status: 'error',
            last_error: result.error || "Failed to connect email account",
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        setConnectionStatus('error');
        setLastError(result.error || "Failed to connect email account");
        throw new Error(result.error || "Failed to connect email account");
      }
      
      // Update database with success
      await supabase
        .from('email_connections')
        .update({
          auto_create_bookings: autoCreateBookings,
          status: 'connected',
          connected_at: new Date().toISOString(),
          last_error: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      setPassword(""); // Clear password for security
      setIsConnected(true);
      setConnectionStatus('connected');
      setLastError(null);
      
      toast({
        title: "Success",
        description: "Email account connected successfully",
      });
      
      return true;
      
    } catch (error: any) {
      console.error("Error connecting email:", error);
      
      // Set local state for error
      setConnectionStatus('error');
      setLastError(error.message || "Failed to connect to email account");
      
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to email account. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
      setIsConnecting(false);
    }
  };

  const disconnectEmail = async () => {
    if (!user) return false;
    
    try {
      setIsLoading(true);
      
      // Update database status first
      await supabase
        .from('email_connections')
        .update({
          status: 'disconnecting',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      // Get the user's session token for authorization
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session found");
      }
      
      const response = await fetch(`${getEdgeFunctionUrl('email-integration')}/disconnect`, {
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
      
      // Update database with disconnected status
      await supabase
        .from('email_connections')
        .update({
          status: 'disconnected',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      setEmailAddress("");
      setPassword("");
      setProvider("gmail");
      setAutoCreateBookings(false);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      
      toast({
        title: "Email Disconnected",
        description: "Your email account has been disconnected"
      });
      
      return true;
      
    } catch (error: any) {
      console.error("Error disconnecting email:", error);
      
      // Update database with error
      await supabase
        .from('email_connections')
        .update({
          status: 'error',
          last_error: error.message || "Failed to disconnect email account",
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
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
    if (!user || !isConnected) {
      return false;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('email_connections')
        .update({
          auto_create_bookings: autoCreateBookings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Settings Updated",
        description: "Your email settings have been updated"
      });
      
      return true;
      
    } catch (error: any) {
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

  // Get provider configuration (host, port, etc)
  const getProviderConfig = (providerName: string): EmailConnectionConfig => {
    switch (providerName) {
      case 'gmail':
        return {
          provider: 'gmail',
          host: 'imap.gmail.com',
          port: 993,
          secure: true
        };
      case 'outlook':
        return {
          provider: 'outlook',
          host: 'outlook.office365.com',
          port: 993,
          secure: true
        };
      case 'yahoo':
        return {
          provider: 'yahoo',
          host: 'imap.mail.yahoo.com',
          port: 993,
          secure: true
        };
      default:
        return {
          provider: 'other',
          host: 'imap.example.com',
          port: 993,
          secure: true
        };
    }
  };

  return {
    isConnected,
    isConnecting,
    emailAddress,
    setEmailAddress,
    password,
    setPassword,
    provider,
    setProvider,
    autoCreateBookings,
    setAutoCreateBookings,
    connectionStatus,
    lastError,
    isLoading,
    connectEmail,
    disconnectEmail,
    updateSettings,
    checkConnection,
    getProviderConfig
  };
};
