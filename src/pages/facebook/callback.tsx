
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const FacebookCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing your Facebook integration...");
  const [connectedPages, setConnectedPages] = useState<any[]>([]);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        if (!user) {
          setStatus("error");
          setMessage("You must be logged in to connect Facebook.");
          return;
        }

        // Parse the query string
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const state = params.get("state");
        const error = params.get("error");
        
        // Check for errors from Facebook
        if (error) {
          setStatus("error");
          setMessage(`Facebook authorization failed: ${error}`);
          return;
        }
        
        // Validate state parameter against user ID (simple validation)
        if (state !== user.id) {
          setStatus("error");
          setMessage("Invalid state parameter. Security validation failed.");
          return;
        }
        
        if (!code) {
          setStatus("error");
          setMessage("No authorization code received from Facebook.");
          return;
        }
        
        // Exchange code for token using our Edge Function
        const exchangeResponse = await supabase.functions.invoke("facebook-token-exchange", {
          body: { code, userId: user.id }
        });
        
        if (exchangeResponse.error) {
          throw new Error(exchangeResponse.error.message || "Failed to exchange token");
        }
        
        const data = exchangeResponse.data;
        
        if (!data.success) {
          throw new Error(data.error || "Failed to connect Facebook pages");
        }
        
        // Set connected pages
        setConnectedPages(data.pages || []);
        setStatus("success");
        setMessage("Facebook pages connected successfully!");
        
        toast({
          title: "Facebook Connected",
          description: `Successfully connected ${data.pages.length} Facebook pages.`,
        });

      } catch (error) {
        console.error("Error processing Facebook callback:", error);
        setStatus("error");
        setMessage(`Failed to complete Facebook integration: ${error.message}`);
        
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "There was a problem connecting to Facebook."
        });
      }
    };

    processOAuthCallback();
  }, [location, user, toast, navigate]);

  const handleContinue = () => {
    navigate("/communication");
  };

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>Facebook Integration</CardTitle>
          <CardDescription>
            {status === "loading" ? "Processing your request..." : 
             status === "success" ? "Connection successful!" : 
             "Connection failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            {status === "loading" && (
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            )}
            {status === "success" && (
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            )}
            {status === "error" && (
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            )}
            <p className="text-lg">{message}</p>
          </div>
          
          {connectedPages.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-medium mb-2">Connected Pages:</h3>
              <ul className="space-y-2">
                {connectedPages.map((page) => (
                  <li key={page.id} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>{page.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <Button 
            className="w-full mt-4" 
            onClick={handleContinue}
          >
            Continue to Communication
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacebookCallback;
