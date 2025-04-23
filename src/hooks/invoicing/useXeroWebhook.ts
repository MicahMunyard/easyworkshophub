
import { supabase } from "@/integrations/supabase/client";

export const useXeroWebhook = () => {
  const getWebhookUrl = async (): Promise<string> => {
    try {
      // Get the Supabase URL to use for the webhook
      const { data, error } = await supabase.functions.invoke('xero-integration/get-webhook-url');
      
      if (error) throw error;
      
      return data.webhookUrl || '';
    } catch (error) {
      console.error('Error getting webhook URL:', error);
      return '';
    }
  };

  return {
    getWebhookUrl
  };
};
