import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getEdgeFunctionUrl, createOrUpdateEmailConnection } from "./utils/supabaseUtils";
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
  
  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      console.log("Checking email connection for user:", user.id);
      
      // Changed from .single() to handle case when no record exists
      const { data, error } = await supabase
        .from('email_connections')
        .select('email_address, provider, auto_create_bookings, status, last_error')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking email connection:", error);
        setIsConnected(false);
        return false;
      }
      
      // Check if we have at least one email connection record
      if (data) {
        console.log("Found email connection:", data);
        setEmailAddress(data.email_address || "");
        setProvider(data.provider || "gmail");
        setAutoCreateBookings(data.auto_create_bookings || false);
        setConnectionStatus(data.status || 'disconnected');
        setLastError(data.last_error || null);
        
        const connected = data.status === 'connected';
        setIsConnected(connected);
        return connected;
      }
      
      // No connection records found - initialize default state
      console.log("No email connection found, initializing default state");
      setEmailAddress("");
      setProvider("gmail");
      setAutoCreateBookings(false);
      setConnectionStatus("disconnected");
      setLastError(null);
      setIsConnected(false);
      return false;
    } catch (error) {
      console.error("Exception checking email connection:", error);
      setIsConnected(false);
      return false;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      checkConnection();
    }
  }, [user, checkConnection]);

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
    setLastError(null); // Clear any previous errors
    
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
      
      // Request URL for the connect function
      const edgeFunctionUrl = getEdgeFunctionUrl('email-integration');
      console.log("Connecting to edge function:", edgeFunctionUrl + "/connect");
      
      const response = await fetch(`${edgeFunctionUrl}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          provider,
          email: emailAddress,
          password,
        }),
      });
      
      const result = await response.json();
      console.log("Connection result:", result);
      
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

  const diagnoseConnectionIssues = async () => {
    if (!user) {
      return "No authenticated user found. Please sign in first.";
    }
    
    try {
      setIsLoading(true);
      
      // Check if the email_connections table exists
      const { count, error: tableCheckError } = await supabase
        .from('email_connections')
        .select('*', { count: 'exact', head: true });
        
      if (tableCheckError && tableCheckError.code === "42P01") {
        return "The email_connections table doesn't exist. Database setup may be incomplete.";
      }
      
      // Try to insert a test record (this will be removed afterward)
      const testEmail = "test@example.com";
      const testProvider = "gmail";
      const insertResult = await createOrUpdateEmailConnection(
        user.id,
        testEmail,
        testProvider,
        "testing"
      );
      
      if (!insertResult) {
        return "Failed to insert a test connection. You may have permission issues.";
      }
      
      // Clean up the test record
      await supabase
        .from('email_connections')
        .delete()
        .eq('user_id', user.id)
        .eq('email_address', testEmail);
      
      return "Database access seems fine. Try connecting again with valid credentials.";
    } catch (error: any) {
      return `Diagnostic error: ${error.message || "Unknown error"}`;
    } finally {
      setIsLoading(false);
      checkConnection(); // Refresh the connection state
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
    getProviderConfig,
    diagnoseConnectionIssues
  };
};
