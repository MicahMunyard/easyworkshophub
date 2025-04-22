
import React from "react";
import { Button } from "@/components/ui/button";
import { Facebook } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useFacebookAuth } from "@/hooks/facebook/useFacebookAuth";
import { Loader2 } from "lucide-react";

const FacebookIntegration: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { fbStatus, isLoading, handleFacebookLogin, handleFacebookLogout } = useFacebookAuth();

  const handleConnect = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in before connecting Facebook."
      });
      return;
    }

    handleFacebookLogin();
  };

  if (isLoading) {
    return (
      <Button variant="outline" className="flex items-center gap-2" disabled>
        <Loader2 className="h-5 w-5 animate-spin" />
        Checking status...
      </Button>
    );
  }

  if (fbStatus?.status === 'connected') {
    return (
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={handleFacebookLogout}
      >
        <Facebook className="h-5 w-5 text-blue-600" />
        Disconnect Facebook
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      onClick={handleConnect}
      disabled={!user}
    >
      <Facebook className="h-5 w-5 text-blue-600" />
      Connect Facebook Page
    </Button>
  );
};

export default FacebookIntegration;
