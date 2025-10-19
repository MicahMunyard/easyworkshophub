import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ManualPageConnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userAccessToken: string;
}

const ManualPageConnectDialog: React.FC<ManualPageConnectDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userAccessToken
}) => {
  const [pageId, setPageId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!pageId.trim()) {
      toast({
        variant: "destructive",
        title: "Page ID Required",
        description: "Please enter a valid Facebook Page ID."
      });
      return;
    }

    setIsConnecting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await supabase.functions.invoke('facebook-token-exchange', {
        body: {
          userAccessToken,
          manualPageId: pageId.trim()
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to connect page");
      }

      toast({
        title: "Page Connected",
        description: "Your Facebook page has been connected successfully."
      });

      onSuccess();
      onClose();
      setPageId("");
    } catch (error: any) {
      console.error("Error connecting page manually:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Could not connect the Facebook page. Please check the Page ID and try again."
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Facebook Page Manually</DialogTitle>
          <DialogDescription>
            Enter your Facebook Page ID to connect it manually. You can find your Page ID in your Page settings under "Page Info".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pageId">Facebook Page ID</Label>
            <Input
              id="pageId"
              placeholder="Enter your Page ID"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              disabled={isConnecting}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">How to find your Page ID:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to your Facebook Page</li>
              <li>Click "Settings" in the left menu</li>
              <li>Click "Page Info" in the left menu</li>
              <li>Your Page ID is listed at the bottom</li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isConnecting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={isConnecting || !pageId.trim()}
          >
            {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Connect Page
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManualPageConnectDialog;
