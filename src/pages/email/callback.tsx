
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const EmailCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Processing OAuth callback...");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const processOAuthCallback = async () => {
      if (!user) {
        setStatus("error");
        setMessage("You must be logged in to complete the email connection process");
        setIsProcessing(false);
        return;
      }

      try {
        // Get the auth code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const provider = urlParams.get("state") || "gmail"; // Get the provider from state parameter

        if (!code) {
          throw new Error("No authorization code found in the callback URL");
        }

        console.log(`Processing OAuth callback with code ${code.substring(0, 10)}... for provider ${provider}`);

        // Get the user's session token
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error("No active session found");
        }

        console.log("Calling oauth-callback endpoint with user's session...");
        
        // Call the edge function to handle the OAuth callback
        const { data, error } = await supabase.functions.invoke('email-integration/oauth-callback', {
          body: { code, provider }
        });

        if (error) {
          console.error("Edge function error:", error);
          throw new Error(error.message || "Failed to complete email connection");
        }

        console.log('OAuth callback successful:', data);
        setEmail(data?.email || "your email account");
        setStatus("success");
        setMessage(`Successfully connected ${data?.email || "your email account"}`);
        
        // Show a success toast
        toast({
          title: "Email Connected",
          description: `Successfully connected ${data?.email || "your email account"}`,
          variant: "default",
        });
      } catch (error: any) {
        console.error("Error processing OAuth callback:", error);
        setStatus("error");
        setMessage(error.message || "Failed to complete email connection");
        
        // Show an error toast
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to complete email connection",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processOAuthCallback();
  }, [user, navigate]);

  const handleContinue = () => {
    navigate("/email-integration");
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Email Connection {status === "success" ? "Complete" : "In Progress"}</CardTitle>
          <CardDescription>
            {status === "processing" ? "We're connecting your email account..." : "Email connection status"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {isProcessing ? (
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          ) : status === "success" ? (
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-medium">{message}</p>
              {email && <p className="text-sm text-muted-foreground mt-2">{email}</p>}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-lg font-medium text-destructive">{message}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={handleContinue} 
            disabled={isProcessing}
          >
            {status === "success" ? "Continue to Email Integration" : "Back to Email Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmailCallback;
