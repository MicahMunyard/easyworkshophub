
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getEdgeFunctionUrl } from "./utils/supabaseUtils";
import { User } from '@supabase/supabase-js';
import { useEmailDiagnostics } from './useEmailDiagnostics';
import { useToast } from '@/hooks/use-toast';

export const useEmailConnection = () => {
  // State management
  const [provider, setProvider] = useState<"gmail" | "outlook" | "yahoo" | "other">("gmail");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting" | "error">("disconnected");
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [autoCreateBookings, setAutoCreateBookings] = useState(false);
  const { toast } = useToast();
  
  // Get current user
  const [user, setUser] = useState<User | null>(null);
  
  useState(() => {
    // Get authenticated user
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    getUser();
  });
  
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
      setIsConnected(data.status === "connected");
      setConnectionStatus(data.status as any);
      setAutoCreateBookings(data.auto_create_bookings || false);
      
      return data.status === "connected";
      
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
        // This is the direct URL to the edge function
        const edgeFunctionUrl = "https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/email-integration/connect";
        console.info("Connecting to edge function:", edgeFunctionUrl);
        
        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({
            provider,
          }),
        });
        
        console.log("Response status:", response.status);
        const result = await response.json();
        console.log("Connection result:", result);
        
        if (!response.ok) {
          console.error("Connection result:", result);
          throw new Error(result.error || "Failed to connect email");
        }
        
        // For OAuth flow, we redirect to the auth URL
        if (result.auth_url) {
          window.location.href = result.auth_url;
          return true; // Return true as we're redirecting
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
      
      const edgeFunctionUrl = getEdgeFunctionUrl('email-integration');
      
      const response = await fetch(`${edgeFunctionUrl}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to disconnect email");
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
