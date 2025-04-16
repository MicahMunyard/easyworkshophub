
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getEdgeFunctionUrl } from "@/hooks/email/utils/supabaseUtils";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const EmailCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const state = params.get("state");
        const provider = params.get("provider") || localStorage.getItem("email_oauth_provider") || "gmail";
        
        console.log("Received OAuth callback with code:", code ? "Present" : "Missing", "and state:", state);
        
        if (!code) {
          const error = params.get("error");
          throw new Error(error || "Authorization code missing from callback");
        }
        
        if (!user) {
          throw new Error("User authentication required. Please sign in again.");
        }
        
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error("No active session found. Please sign in again.");
        }
        
        // Process the OAuth callback with our edge function
        const edgeFunctionUrl = getEdgeFunctionUrl('email-integration');
        
        const response = await fetch(`${edgeFunctionUrl}/oauth-callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({
            code,
            state,
            provider
          }),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || "Failed to complete email authentication");
        }
        
        toast({
          title: "Success!",
          description: `Your ${provider} account has been connected successfully.`
        });
        
        // Clear any stored state
        localStorage.removeItem("email_oauth_provider");
        
        // Redirect back to the email integration page
        navigate("/EmailIntegration");
      } catch (error: any) {
        console.error("OAuth callback error:", error);
        setError(error.message || "An error occurred during email connection");
        
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: error.message || "Failed to connect email account"
        });
        
        // After showing the error, redirect back to the email settings
        setTimeout(() => {
          navigate("/EmailIntegration?tab=settings");
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };
    
    handleOAuthCallback();
  }, [location.search, user, navigate, toast]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {isProcessing ? (
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-semibold mb-2">Processing Email Connection</h2>
          <p className="text-muted-foreground">
            Please wait while we complete connecting your email account...
          </p>
        </div>
      ) : error ? (
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 p-4 rounded-lg mb-4">
            <h2 className="text-xl font-semibold text-destructive mb-2">Connection Failed</h2>
            <p>{error}</p>
          </div>
          <p>Redirecting you back to settings...</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <h2 className="text-xl font-semibold text-green-600 mb-2">Connection Successful</h2>
            <p>Your email account has been connected successfully!</p>
          </div>
          <p>Redirecting you back to the application...</p>
        </div>
      )}
    </div>
  );
};

export default EmailCallback;
