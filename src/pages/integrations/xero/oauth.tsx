
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const XeroOAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processOAuthCallback = async () => {
      if (!user) {
        setStatus("error");
        setError("You must be logged in to connect to Xero");
        return;
      }

      const code = searchParams.get("code");
      if (!code) {
        setStatus("error");
        setError("No authorization code provided");
        return;
      }

      try {
        // Call the edge function to exchange the code for a token
        const { data, error: functionError } = await supabase.functions.invoke(
          "xero-integration/oauth-callback",
          {
            body: { code }
          }
        );

        if (functionError || !data?.success) {
          throw new Error(functionError?.message || data?.error || "Failed to connect to Xero");
        }

        setStatus("success");
      } catch (err: any) {
        console.error("Error connecting to Xero:", err);
        setStatus("error");
        setError(err.message || "An error occurred while connecting to Xero");
      }
    };

    processOAuthCallback();
  }, [user]);

  const handleClose = () => {
    navigate("/invoicing");
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Xero Connection</CardTitle>
          <CardDescription>
            {status === "loading"
              ? "Processing your Xero authorization..."
              : status === "success"
              ? "Your Xero account has been connected!"
              : "Failed to connect to Xero"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center py-8">
            {status === "loading" ? (
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            ) : status === "success" ? (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          
          {status === "error" && error && (
            <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}
          
          {status !== "loading" && (
            <Button onClick={handleClose} className="w-full">
              {status === "success" ? "Continue to Invoicing" : "Try Again"}
            </Button>
          )}
          
          {status === "success" && (
            <p className="text-center text-sm text-muted-foreground">
              You can now sync your invoices between WorkshopBase and Xero
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default XeroOAuthCallback;
