
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const useEmailConnectionStatus = (user: User | null) => {
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected" | "error" | "token_expired">("disconnected");
  const [lastError, setLastError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateConnectionStatus = async (status: "connected" | "connecting" | "disconnected" | "error" | "token_expired", errorMessage?: string) => {
    if (!user) return;
    
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'connected') {
      updateData.connected_at = new Date().toISOString();
      updateData.last_error = null;
    } else if (status === 'error' && errorMessage) {
      updateData.last_error = errorMessage;
    }
    
    await supabase
      .from('email_connections')
      .update(updateData)
      .eq('user_id', user.id);

    setConnectionStatus(status);
    if (errorMessage) {
      setLastError(errorMessage);
    }
  };

  return {
    connectionStatus,
    lastError,
    isLoading,
    setIsLoading,
    setConnectionStatus,
    setLastError,
    updateConnectionStatus
  };
};
