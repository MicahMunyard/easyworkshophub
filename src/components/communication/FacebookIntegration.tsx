
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Facebook } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Facebook App ID - Replace with your real Facebook App ID
const FACEBOOK_APP_ID = "1234567890123456"; // Replace this with your actual Facebook App ID

const FacebookIntegration: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in before connecting Facebook."
      });
      return;
    }

    setIsConnecting(true);
    
    // Define the redirect URL - this should be a page in your app that handles the OAuth callback
    const redirectUri = `${window.location.origin}/facebook/callback`;
    
    // Permissions needed for Facebook Messenger integration
    const scope = "public_profile,pages_messaging,pages_show_list,pages_manage_metadata";
    
    // State parameter to validate the callback later
    const state = user.id;
    
    // Build the Facebook OAuth URL
    const authUrl = `https://www.facebook.com/v17.0/dialog/oauth?` +
      `client_id=${FACEBOOK_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${state}` +
      `&scope=${scope}`;
    
    // Redirect to Facebook OAuth dialog
    window.location.href = authUrl;
  };

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      onClick={handleConnect}
      disabled={isConnecting || !user}
    >
      <Facebook className="h-5 w-5 text-blue-600" />
      {isConnecting ? "Connecting..." : "Connect Facebook Page"}
    </Button>
  );
};

export default FacebookIntegration;
