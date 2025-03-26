
import React from "react";
import { Button } from "@/components/ui/button";
import { Mail, Trash2 } from "lucide-react";

interface EmailSettingsActionsProps {
  isConnected: boolean;
  isLoading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSaveSettings: () => void;
}

const EmailSettingsActions: React.FC<EmailSettingsActionsProps> = ({
  isConnected,
  isLoading,
  onConnect,
  onDisconnect,
  onSaveSettings
}) => {
  return (
    <>
      {isConnected ? (
        <>
          <Button 
            variant="outline" 
            type="button" 
            onClick={onDisconnect}
            disabled={isLoading}
            className="gap-1"
          >
            <Trash2 className="h-4 w-4" /> Disconnect Account
          </Button>
          <Button 
            type="button" 
            onClick={onSaveSettings}
            disabled={isLoading}
          >
            Save Settings
          </Button>
        </>
      ) : (
        <>
          <div></div> {/* Empty div for spacing */}
          <Button 
            type="button" 
            onClick={onConnect}
            disabled={isLoading}
            className="gap-1"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full inline-block animate-spin mr-1"></span>
                Connecting...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" /> Connect Account
              </>
            )}
          </Button>
        </>
      )}
    </>
  );
};

export default EmailSettingsActions;
