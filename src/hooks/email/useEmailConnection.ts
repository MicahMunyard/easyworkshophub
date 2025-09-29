import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import { useEmailDiagnostics } from './useEmailDiagnostics';
import { useToast } from '@/hooks/use-toast';

export const useEmailConnection = () => {
  // State management
  const [provider, setProvider] = useState<"gmail" | "outlook" | "yahoo" | "other">("gmail");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting" | "error" | "token_expired">("disconnected");
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [autoCreateBookings, setAutoCreateBookings] = useState(false);
  const { toast } = useToast();
  
  // Get current user
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Get authenticated user
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    getUser();
  }, []);
  
  // Get diagnostic functions
  const { diagnoseConnectionIssues } = useEmailDiagnostics(user);

  // Check if email is connected
  const checkConnection = useCallback(async () => {
    if (!user) {
      console.info("No user logged in");
      return false;
    }
    
    console.info("Checking email connection for user:", user.id);
    
    try {
      // Get authenticated session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.info("No active session");
        return false;
      }
      
      // Fetch connection information from the database
      const { data, error } = await supabase
        .from('email_connections')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking connection:", error);
        setLastError(`Database error: ${error.message}`);
        setConnectionStatus("error");
        return false;
      }
      
      if (!data) {
        console.info("No email connection found, initializing default state");
        setIsConnected(false);
        setConnectionStatus("disconnected");
        setProvider("gmail");
        setEmailAddress("");
        setPassword("");
        setAutoCreateBookings(false);
        return false;
      }
      
      // Update state with connection data
      setProvider(data.provider as any);
      setEmailAddress(data.email_address || "");
      setAutoCreateBookings(data.auto_create_bookings || false);
      
      // Check if token is expired and update status if needed
      const isTokenExpired = data.token_expires_at && 
        new Date(data.token_expires_at) <= new Date();
      
      if (isTokenExpired && data.status === 'connected') {
        console.log("Token expired, connection needs refresh");
        setConnectionStatus('token_expired');
        setLastError('Access token expired. Please reconnect your email account.');
        setIsConnected(false);
        return false;
      }
      
      const isConnected = data.status === "connected" && !isTokenExpired;
      setIsConnected(isConnected);
      setConnectionStatus(data.status as any);
      
      return isConnected;
      
    } catch (error: any) {
      console.error("Error checking connection:", error);
      setLastError(`Error: ${error.message}`);
      return false;
    }
  }, [user]);

  // Connect to email
  const connectEmail = async () => {
    if (!user) {
      setLastError("You must be logged in to connect email");
      return false;
    }
    
    setIsLoading(true);
    setLastError(null);
    
    try {
      // Get authenticated session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session found");
      }
      
      // For OAuth providers (Gmail, Outlook), we call the edge function to get the OAuth URL
      if (provider === "gmail" || provider === "outlook") {
        console.info("Connecting to edge function for OAuth URL");
        
        try {
          const { data, error } = await supabase.functions.invoke('email-integration/connect', {
            method: 'POST',
            body: { provider },
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
            }
          });
          
          if (error) {
            console.error("Edge function error:", error);
            throw new Error(`Edge function error: ${error.message || String(error)}`);
          }
          
          console.log("Connection result:", data);
          
          if (!data) {
            throw new Error("No response received from edge function");
          }
          
          // For OAuth flow, we redirect to the auth URL
          if (data.auth_url) {
            window.location.href = data.auth_url;
            return true; // Return true as we're redirecting
          }
        } catch (error: any) {
          console.error("Error invoking edge function:", error);
          throw new Error(`Failed to connect to OAuth service: ${error.message || String(error)}`);
        }
      } else {
        // For non-OAuth providers, we save the credentials to the database
        if (!emailAddress) {
          setLastError("Please provide your email address");
          return false;
        }
        
        // Update the database
        const { error } = await supabase
          .from('email_connections')
          .upsert({
            user_id: user.id,
            email_address: emailAddress,
            provider: provider,
            status: 'connected', // Set as connected for non-OAuth providers
            updated_at: new Date().toISOString(),
            auto_create_bookings: autoCreateBookings
          }, {
            onConflict: 'user_id'
          });
          
        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }
        
        // Update local state
        setIsConnected(true);
        setConnectionStatus("connected");
        
        toast({
          title: "Email Connected",
          description: `Successfully connected to ${emailAddress}`
        });
      }
      
      return true;
    } catch (error: any) {
      console.error("Error connecting email:", error);
      setLastError(error.message || "Failed to connect email");
      setConnectionStatus("error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect email
  const disconnectEmail = async () => {
    if (!user) {
      setLastError("You must be logged in to disconnect email");
      return false;
    }
    
    setIsLoading(true);
    setLastError(null);
    
    try {
      // Get authenticated session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session found");
      }
      
      const { data, error } = await supabase.functions.invoke('email-integration/disconnect', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        }
      });
      
      if (error) {
        throw new Error(`Edge function error: ${error.message || "Failed to disconnect email"}`);
      }
      
      // Update local state
      setIsConnected(false);
      setConnectionStatus("disconnected");
      
      toast({
        title: "Email Disconnected",
        description: "Your email account has been disconnected"
      });
      
      return true;
    } catch (error: any) {
      console.error("Error disconnecting email:", error);
      setLastError(`Error: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update settings
  const updateSettings = async () => {
    if (!user) {
      setLastError("You must be logged in to update settings");
      return false;
    }
    
    setIsLoading(true);
    setLastError(null);
    
    try {
      // Update the database
      const { error } = await supabase
        .from('email_connections')
        .update({
          auto_create_bookings: autoCreateBookings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
        
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      return true;
    } catch (error: any) {
      console.error("Error updating settings:", error);
      setLastError(`Error: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    emailAddress,
    setEmailAddress,
    password,
    setPassword,
    provider,
    setProvider,
    isConnected,
    connectionStatus,
    isLoading,
    lastError,
    autoCreateBookings,
    setAutoCreateBookings,
    connectEmail,
    disconnectEmail,
    checkConnection,
    updateSettings,
    diagnoseConnectionIssues
  };
};
