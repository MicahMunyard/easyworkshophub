
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// This function cleans up all demo data from the system
export const cleanupDemoData = async (userId: string): Promise<void> => {
  // Clean up demo email templates
  try {
    // Find and delete demo email templates
    const { error: templateError } = await supabase
      .from('email_templates')
      .delete()
      .eq('user_id', userId)
      .ilike('name', '%Demo%');
    
    if (templateError) {
      console.error("Error cleaning up demo email templates:", templateError);
    }
    
    // Find and delete demo email campaigns
    const { error: campaignError } = await supabase
      .from('email_campaigns')
      .delete()
      .eq('user_id', userId)
      .ilike('name', '%Demo%');
    
    if (campaignError) {
      console.error("Error cleaning up demo email campaigns:", campaignError);
    }
    
    // Find and delete demo email automations
    const { error: automationError } = await supabase
      .from('email_automations')
      .delete()
      .eq('user_id', userId)
      .ilike('name', '%Demo%');
    
    if (automationError) {
      console.error("Error cleaning up demo email automations:", automationError);
    }
    
    console.log("Demo email marketing data cleanup completed");
  } catch (error) {
    console.error("Error in demo data cleanup:", error);
  }
};

// Hook for cleaning up demo data
export const useCleanupDemoData = () => {
  const { toast } = useToast();

  const runCleanup = async (userId: string) => {
    try {
      await cleanupDemoData(userId);
      toast({
        title: "Demo data removed",
        description: "All demo marketing content has been removed from your account."
      });
    } catch (error) {
      console.error("Error in demo data cleanup:", error);
      toast({
        title: "Error removing demo data",
        description: "There was an issue removing the demo content. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return { runCleanup };
};
