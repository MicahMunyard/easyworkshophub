
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Facebook } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useFacebookAuth } from "@/hooks/facebook/useFacebookAuth";
import { Loader2 } from "lucide-react";
import FacebookPageSelector from "./FacebookPageSelector";
import ManualPageConnectDialog from "./ManualPageConnectDialog";

const FacebookIntegration: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    fbStatus, 
    isLoading, 
    handleFacebookLogin, 
    handleFacebookLogout,
    availablePages,
    showPageSelector,
    setShowPageSelector,
    handlePageSelection
  } = useFacebookAuth();
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [manualUserToken, setManualUserToken] = useState("");

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

  const handlePageToggle = (pageId: string) => {
    setSelectedPages(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleConfirmSelection = () => {
    handlePageSelection(selectedPages);
  };

  const handleCancelSelection = () => {
    setShowPageSelector(false);
    setSelectedPages([]);
    
    // If no pages, offer manual connection
    if (availablePages.length === 0 && fbStatus?.authResponse?.accessToken) {
      setManualUserToken(fbStatus.authResponse.accessToken);
      setShowManualDialog(true);
    }
  };

  const handleManualSuccess = () => {
    setShowManualDialog(false);
    setManualUserToken("");
    window.location.reload();
  };

  return (
    <>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={handleConnect}
        disabled={!user}
      >
        <Facebook className="h-5 w-5 text-blue-600" />
        Connect Facebook Page
      </Button>

      <FacebookPageSelector
        isOpen={showPageSelector && availablePages.length > 0}
        pages={availablePages}
        selectedPages={selectedPages}
        onPageToggle={handlePageToggle}
        onConfirm={handleConfirmSelection}
        onCancel={handleCancelSelection}
        isLoading={isLoading}
      />

      <ManualPageConnectDialog
        isOpen={showManualDialog}
        onClose={() => setShowManualDialog(false)}
        onSuccess={handleManualSuccess}
        userAccessToken={manualUserToken}
      />
    </>
  );
};

export default FacebookIntegration;
