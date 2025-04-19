
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getEdgeFunctionUrl } from "./utils/supabaseUtils";
import { User } from '@supabase/supabase-js';

export const useEmailDiagnostics = (user: User | null) => {
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const diagnoseConnectionIssues = async (): Promise<string> => {
    if (!user) {
      return "Error: You must be logged in to diagnose email connection issues";
    }

    setIsDiagnosing(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session found");
      }
      
      const edgeFunctionUrl = getEdgeFunctionUrl('email-integration');
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          action: 'diagnose'
        }),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return "No email connection found. Please set up your email integration first.";
        }
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      return data.diagnosticMessage || "Diagnosis completed but no specific issues found.";
    } catch (error: any) {
      console.error("Error diagnosing connection:", error);
      return `Diagnostic error: ${error.message}`;
    } finally {
      setIsDiagnosing(false);
    }
  };

  return {
    isDiagnosing,
    diagnoseConnectionIssues
  };
};
