
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getEdgeFunctionUrl } from "./utils/supabaseUtils";
import { getProviderConfig } from "./utils/providerConfigs";
import { useEmailConnectionStatus } from "./useEmailConnectionStatus";
import { useEmailDiagnostics } from "./useEmailDiagnostics";

export const useEmailConnection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [provider, setProvider] = useState<"gmail" | "outlook" | "yahoo" | "other">("gmail");
  const [autoCreateBookings, setAutoCreateBookings] = useState(false);
  
  const {
    connectionStatus,
    lastError,
    isLoading,
    setIsLoading,
    updateConnectionStatus,
    connectionStatus: setConnectionStatus,
    lastError: setLastError
  } = useEmailConnectionStatus(user);
  
  const { diagnoseConnectionIssues } = useEmailDiagnostics(user);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      console.log("Checking email connection for user:", user.id);
      
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
      
      if (data) {
        console.log("Found email connection:", data);
        setEmailAddress(data.email_address || "");
        setProvider((data.provider || "gmail") as "gmail" | "outlook" | "yahoo" | "other");
        setAutoCreateBookings(data.auto_create_bookings || false);
        
        const connected = data.status === 'connected';
        setIsConnected(connected);
        return connected;
      }
      
      console.log("No email connection found, initializing default state");
      setEmailAddress("");
      setProvider("gmail");
      setAutoCreateBookings(false);
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
    
    // For OAuth providers (gmail or outlook), we don't need to validate email address
    // Only validate email for IMAP providers (yahoo or other)
    if (!emailAddress && (provider === "yahoo" || provider === "other")) {
      toast({
        title: "Missing Information",
        description: "Please provide your email address",
        variant: "destructive"
      });
      return false;
    }
    
    setIsLoading(true);
    setIsConnecting(true);
    updateConnectionStatus('connecting');
    
    try {
      await supabase
        .from('email_connections')
        .upsert({
          user_id: user.id,
          email_address: emailAddress || null, // Make email optional for OAuth flows
          provider: provider,
          auto_create_bookings: autoCreateBookings,
          status: 'connecting',
          last_error: null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session found");
      }
      
      const edgeFunctionUrl = getEdgeFunctionUrl('email-integration');
      console.log("Connecting to edge function:", edgeFunctionUrl + "/connect");
      
      if (provider === 'gmail' || provider === 'outlook') {
        const response = await fetch(`${edgeFunctionUrl}/connect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({
            provider,
            email: emailAddress || null, // Email can be null for OAuth flows
            password: undefined,
          }),
        });
        
        const result = await response.json();
        console.log("Connection result:", result);
        
        if (!response.ok) {
          throw new Error(result.error || "Failed to initiate email connection");
        }
        
        if (result.auth_url) {
          console.log("Redirecting to OAuth URL:", result.auth_url);
          // Direct redirection to OAuth provider
          window.location.href = result.auth_url;
          return true;
        }
        
        updateConnectionStatus('connected');
        setIsConnected(true);
        
        toast({
          title: "Success",
          description: "Email account connected successfully",
        });
        
        return true;
      } else if (provider === 'yahoo' || provider === 'other') {
        if (!password) {
          throw new Error("Password is required for this email provider");
        }
        
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
          await updateConnectionStatus('error', result.error || "Failed to connect email account");
          throw new Error(result.error || "Failed to connect email account");
        }
        
        await updateConnectionStatus('connected');
        
        setPassword("");
        setIsConnected(true);
        
        toast({
          title: "Success",
          description: "Email account connected successfully",
        });
        
        return true;
      } else {
        throw new Error("Unsupported email provider");
      }
    } catch (error: any) {
      console.error("Error connecting email:", error);
      
      updateConnectionStatus('error', error.message || "Failed to connect to email account");
      
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
      
      await supabase
        .from('email_connections')
        .update({
          status: 'disconnecting',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
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
      updateConnectionStatus('disconnected');
      
      toast({
        title: "Email Disconnected",
        description: "Your email account has been disconnected"
      });
      
      return true;
      
    } catch (error: any) {
      console.error("Error disconnecting email:", error);
      
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
        title: "Settings Saved",
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
