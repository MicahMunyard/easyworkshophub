import { useState, useEffect, useCallback } from "react";
import { EmailTemplate, EmailCampaign, EmailAutomation, EmailAnalytic, SendgridFormValues, SendgridEmailOptions } from "./types";
import { useSendgrid } from "@/hooks/email/useSendgrid";
import { useSendgridEmail } from "@/hooks/email/useSendgridEmail";
import { useToast } from "@/hooks/use-toast";

export const useEmailMarketing = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [analytics, setAnalytics] = useState<EmailAnalytic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailConfigured, setIsEmailConfigured] = useState(false);
  
  const { isConfigured: isSendgridConfigured, getWorkshopEmail } = useSendgrid();
  const { sendEmail, sendMarketingCampaign, getAnalytics } = useSendgridEmail();
  const { toast } = useToast();

  // Load email marketing data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch data from an API
        // For now, we'll use mock data
        
        // Mock templates
        setTemplates([
          {
            id: "template-1",
            name: "Service Reminder",
            subject: "Your vehicle is due for service",
            content: "<p>Hello {{customer_name}},</p><p>Your {{vehicle}} is due for service on {{service_date}}.</p>",
            category: "reminder",
            description: "Reminder for upcoming vehicle service",
            created_at: "2025-04-01T10:00:00Z",
            updated_at: "2025-04-01T10:00:00Z"
          },
          {
            id: "template-2",
            name: "Spring Promotion",
            subject: "Special Spring Offers at {{workshop_name}}",
            content: "<p>Hello {{customer_name}},</p><p>Check out our spring specials!</p>",
            category: "promotion",
            description: "Spring promotional offers",
            created_at: "2025-04-15T10:00:00Z",
            updated_at: "2025-04-15T10:00:00Z"
          }
        ]);
        
        // Mock campaigns
        setCampaigns([
          {
            id: "campaign-1",
            name: "April Service Reminder",
            subject: "Your vehicle is due for service",
            template_id: "template-1",
            scheduled_for: "2025-04-20T09:00:00Z",
            status: "scheduled",
            recipient_count: 120,
            open_rate: 0,
            click_rate: 0,
            created_at: "2025-04-10T10:00:00Z",
            audienceType: "all",
            sendImmediately: false
          },
          {
            id: "campaign-2",
            name: "Spring Promotion",
            subject: "Special Spring Offers",
            template_id: "template-2",
            sent_at: "2025-03-15T09:00:00Z",
            status: "sent",
            recipient_count: 200,
            open_rate: 35.5,
            click_rate: 12.7,
            created_at: "2025-03-10T10:00:00Z",
            audienceType: "segment",
            sendImmediately: true,
            segmentIds: ["segment-1"]
          }
        ]);
        
        // Mock automations
        setAutomations([
          {
            id: "automation-1",
            name: "Monthly Newsletter",
            description: "Sent on the first of every month",
            trigger_type: "schedule",
            trigger_details: {
              schedule: "0 9 1 * *" // 9am on 1st day of month
            },
            template_id: "template-2",
            status: "active",
            created_at: "2025-03-01T10:00:00Z",
            next_run: "2025-05-01T09:00:00Z",
            frequency: "monthly"
          }
        ]);
        
        // Get analytics data if SendGrid is configured
        if (isSendgridConfigured) {
          const analyticsData = await getAnalytics();
          setAnalytics(analyticsData);
        }
        
        // Check if email is configured
        setIsEmailConfigured(isSendgridConfigured);
        
      } catch (error) {
        console.error("Error loading email marketing data:", error);
        toast({
          title: "Failed to load email marketing data",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isSendgridConfigured, getAnalytics, toast]);

  // Create a new template
  const createTemplate = async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // In a real app, this would send the template to an API
      const newTemplate: EmailTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setTemplates(prev => [newTemplate, ...prev]);
      
      toast({
        title: "Template created",
        description: "Your email template has been saved",
      });
      
      return true;
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Failed to create template",
        description: "Please try again later",
        variant: "destructive",
      });
      return false;
    }
  };

  // Create a new campaign
  const createCampaign = async (campaign: Omit<EmailCampaign, 'id' | 'created_at' | 'status' | 'recipient_count' | 'open_rate' | 'click_rate' | 'sent_at'>) => {
    try {
      // Find the template
      const template = templates.find(t => t.id === campaign.template_id);
      if (!template) {
        throw new Error("Template not found");
      }
      
      // In a real app, this would send the campaign to an API
      const newCampaign: EmailCampaign = {
        ...campaign,
        id: `campaign-${Date.now()}`,
        status: campaign.sendImmediately ? "sending" : "scheduled",
        recipient_count: 0,
        created_at: new Date().toISOString()
      };
      
      setCampaigns(prev => [newCampaign, ...prev]);
      
      toast({
        title: "Campaign created",
        description: campaign.sendImmediately 
          ? "Your email campaign is being sent" 
          : "Your email campaign has been scheduled",
      });
      
      return true;
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Failed to create campaign",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
      return false;
    }
  };

  // Create a new automation
  const createAutomation = async (automation: Omit<EmailAutomation, 'id' | 'created_at'>) => {
    try {
      // Find the template
      const template = templates.find(t => t.id === automation.template_id);
      if (!template) {
        throw new Error("Template not found");
      }
      
      // In a real app, this would send the automation to an API
      const newAutomation: EmailAutomation = {
        ...automation,
        id: `automation-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      
      setAutomations(prev => [newAutomation, ...prev]);
      
      toast({
        title: "Automation created",
        description: "Your email automation has been saved",
      });
      
      return true;
    } catch (error) {
      console.error("Error creating automation:", error);
      toast({
        title: "Failed to create automation",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
      return false;
    }
  };

  // Send a test email
  const sendTestEmail = async (recipients: string[], options: any) => {
    try {
      if (!isEmailConfigured) {
        return { 
          success: false,
          message: "SendGrid is not configured. Please configure it in Settings."
        };
      }
      
      // Send the test email
      const result = await sendEmail({
        to: recipients,
        subject: `[TEST] ${options.subject || "Test Email"}`,
        html: options.content,
        text: options.note ? `Note: ${options.note}\n\n---\n\n` : undefined,
        from: options.from || undefined
      });
      
      if (result.success) {
        return {
          success: true,
          message: `Test email sent to ${recipients.join(", ")}`
        };
      } else {
        throw new Error(result.error?.message || "Failed to send test email");
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred"
      };
    }
  };

  // Save SendGrid configuration
  const saveSendgridConfig = async (config: SendgridFormValues): Promise<boolean> => {
    try {
      // In a real app, this would save the configuration to an API or database
      // For now, we'll just simulate a successful save
      
      // Wait a bit to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the configuration state
      setIsEmailConfigured(true);
      
      toast({
        title: "SendGrid configuration saved",
        description: "Your SendGrid settings have been updated"
      });
      
      return true;
    } catch (error) {
      console.error("Error saving SendGrid configuration:", error);
      toast({
        title: "Failed to save SendGrid configuration",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
      return false;
    }
  };

  // Test SendGrid connection
  const testSendgridConnection = async (): Promise<{ success: boolean; message: string }> => {
    try {
      // In a real app, this would test the connection to SendGrid
      // For now, we'll just simulate a successful test
      
      // Wait a bit to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: "Successfully connected to SendGrid"
      };
    } catch (error) {
      console.error("Error testing SendGrid connection:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to connect to SendGrid"
      };
    }
  };

  // Export analytics to CSV or PDF
  const exportAnalytics = async (format: 'csv' | 'pdf'): Promise<void> => {
    try {
      // In a real app, this would generate and download the export file
      // For now, we'll just show a toast message
      toast({
        title: `Analytics exported as ${format.toUpperCase()}`,
        description: "Your export is ready to download"
      });
    } catch (error) {
      console.error(`Error exporting analytics as ${format}:`, error);
      toast({
        title: `Failed to export analytics as ${format}`,
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    }
  };

  return {
    templates,
    campaigns,
    automations,
    analytics,
    isLoading,
    isEmailConfigured,
    createTemplate,
    createCampaign,
    createAutomation,
    sendTestEmail,
    saveSendgridConfig,
    testSendgridConnection,
    exportAnalytics
  };
};
