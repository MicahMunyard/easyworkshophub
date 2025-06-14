
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSendgridEmail } from "@/hooks/email/useSendgridEmail";
import type { EmailTemplate, EmailCampaign, EmailAutomation, EmailAnalytic } from "./types";

export const useEmailMarketing = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [analytics, setAnalytics] = useState<EmailAnalytic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { sendEmail } = useSendgridEmail();
  
  // Create a new template
  const createTemplate = async (template: Omit<EmailTemplate, "id" | "created_at" | "updated_at">) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      const newTemplate: EmailTemplate = {
        id: `template-${Math.random().toString(36).substr(2, 9)}`,
        name: template.name,
        subject: template.subject,
        content: template.content,
        category: template.category,
        description: template.description,
        created_at: new Date().toISOString(),
      };
      
      setTemplates(prev => [...prev, newTemplate]);
      
      toast({
        title: "Template created",
        description: "Your email template has been created successfully",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Failed to create template",
        description: "There was an error creating your template",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new automation
  const createAutomation = async (automation: Omit<EmailAutomation, "id" | "created_at">) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      const newAutomation: EmailAutomation = {
        id: `automation-${Math.random().toString(36).substr(2, 9)}`,
        name: automation.name,
        description: automation.description,
        trigger_type: automation.trigger_type,
        trigger_details: automation.trigger_details,
        template_id: automation.template_id,
        is_active: false,
        audience_type: automation.audience_type,
        segment_ids: automation.segment_ids,
        created_at: new Date().toISOString(),
        status: "draft",
        next_run: automation.next_run,
        frequency: automation.frequency,
      };
      
      setAutomations(prev => [...prev, newAutomation]);
      
      toast({
        title: "Automation created",
        description: "Your email automation has been created successfully",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Failed to create automation",
        description: "There was an error creating your automation",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new campaign
  const createCampaign = async (campaign: Omit<EmailCampaign, "id" | "created_at" | "status" | "recipient_count" | "open_rate" | "click_rate" | "sent_at" | "updated_at">) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      const newCampaign: EmailCampaign = {
        id: `campaign-${Math.random().toString(36).substr(2, 9)}`,
        name: campaign.name,
        subject: campaign.subject,
        content: campaign.content,
        template_id: campaign.template_id,
        status: campaign.send_immediately ? "sending" : "draft",
        audience_type: campaign.audience_type || "all",
        recipient_count: 0,
        scheduled_for: campaign.scheduled_for,
        created_at: new Date().toISOString(),
      };
      
      setCampaigns(prev => [...prev, newCampaign]);
      
      if (campaign.send_immediately) {
        // Simulate sending
        setTimeout(() => {
          setCampaigns(prev => 
            prev.map(c => 
              c.id === newCampaign.id 
                ? {...c, status: "sent", sent_at: new Date().toISOString(), recipient_count: 150, open_rate: 0, click_rate: 0} 
                : c
            )
          );
          
          // Add to analytics
          setAnalytics(prev => [
            ...prev,
            {
              campaign_id: newCampaign.id,
              campaign_name: newCampaign.name,
              sent_date: new Date().toISOString(),
              recipients: 150,
              opens: 0,
              clicks: 0,
            }
          ]);
          
          toast({
            title: "Campaign sent",
            description: "Your campaign has been sent successfully",
          });
        }, 2000);
      }
      
      toast({
        title: "Campaign created",
        description: campaign.send_immediately 
          ? "Your email campaign is being sent" 
          : "Your email campaign has been saved as draft",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Failed to create campaign",
        description: "There was an error creating your campaign",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Send a test email
  const sendTestEmail = async (recipients: string[], options: any) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would send an actual email
      const result = await sendEmail(
        recipients[0],
        {
          to: recipients[0],
          subject: options.subject,
          html: options.content,
          text: "This is a test email"
        }
      );
      
      if (result.success) {
        toast({
          title: "Test email sent",
          description: "Your test email has been sent successfully",
        });
      } else {
        throw new Error(result.error?.message || "Failed to send test email");
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        title: "Failed to send test email",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to send test email" 
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Export analytics data as CSV
  const exportAnalytics = useCallback(() => {
    // In a real app, this would generate and download a CSV file
    toast({
      title: "Analytics exported",
      description: "Your analytics data has been exported",
    });
  }, [toast]);

  return {
    templates,
    campaigns,
    automations,
    analytics,
    isLoading,
    createTemplate,
    createCampaign,
    createAutomation,
    sendTestEmail,
    exportAnalytics,
  };
};
