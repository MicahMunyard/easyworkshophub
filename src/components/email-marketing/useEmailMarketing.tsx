
import { useState, useEffect } from "react";
import { EmailTemplate, EmailCampaign, EmailAutomation, EmailAnalytic } from "./types";
import { useToast } from "@/hooks/use-toast";
import { useSendgridEmail } from "@/hooks/email/useSendgridEmail";

// Mock data for initial development
const dummyTemplates: EmailTemplate[] = [
  {
    id: "template-1",
    name: "Service Reminder",
    description: "Send reminders for upcoming vehicle services",
    subject: "Your Vehicle Service Reminder",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Upcoming Service Reminder</h2>
        <p>Hello {{customer_name}},</p>
        <p>This is a reminder that your {{vehicle}} is due for its {{service_type}} on {{service_date}}.</p>
        <p>Please contact us if you need to reschedule.</p>
        <p>Thank you for choosing {{workshop_name}}.</p>
      </div>
    `,
    category: "reminder",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "template-2",
    name: "Winter Special",
    description: "Promote winter service specials",
    subject: "Winter Service Special - Save 15%",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Winter Service Special</h2>
        <p>Hello {{customer_name}},</p>
        <p>Get your {{vehicle}} ready for winter with our special service offer!</p>
        <p>Book before {{expiry_date}} to save 15% on your next service.</p>
        <p>{{workshop_name}} - Keeping you safe on the road.</p>
      </div>
    `,
    category: "promotion",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const dummyCampaigns: EmailCampaign[] = [
  {
    id: "campaign-1",
    name: "May Service Reminders",
    subject: "Your Vehicle Service Reminder",
    template_id: "template-1",
    status: "sent",
    recipient_count: 128,
    open_rate: 53.1,
    click_rate: 24.2,
    audienceType: "all",
    sendImmediately: true,
    sent_at: "2025-05-02T10:30:00Z",
    created_at: "2025-05-01T08:15:00Z"
  },
  {
    id: "campaign-2",
    name: "Summer Special Promotion",
    subject: "Summer Service Special - Save 20%",
    template_id: "template-2",
    status: "draft",
    recipient_count: 0,
    audienceType: "segment",
    segmentIds: ["segment-1"],
    sendImmediately: false,
    scheduled_for: "2025-06-01T09:00:00Z",
    created_at: "2025-05-10T11:20:00Z"
  }
];

const dummyAutomations: EmailAutomation[] = [
  {
    id: "auto-1",
    name: "Service Follow-up",
    description: "Automatically send follow-up email 3 days after service",
    trigger_type: "event",
    trigger_details: {
      event: "service_completed"
    },
    template_id: "template-1",
    status: "active",
    created_at: "2025-04-15T14:30:00Z",
    last_run: "2025-05-08T10:15:00Z",
    next_run: "2025-05-11T10:15:00Z"
  },
  {
    id: "auto-2",
    name: "Monthly Newsletter",
    description: "Send monthly newsletter on the 1st of each month",
    trigger_type: "schedule",
    trigger_details: {
      schedule: "monthly"
    },
    frequency: "monthly",
    template_id: "template-2",
    status: "active",
    created_at: "2025-03-20T09:45:00Z",
    last_run: "2025-05-01T08:00:00Z",
    next_run: "2025-06-01T08:00:00Z"
  }
];

const dummyAnalytics: EmailAnalytic[] = [
  {
    campaign_id: "campaign-1",
    campaign_name: "May Service Reminders",
    date: "2025-05-02",
    sent_count: 128,
    open_count: 68,
    click_count: 31
  },
  {
    campaign_id: "campaign-2",
    campaign_name: "April Newsletter",
    date: "2025-04-05",
    sent_count: 142,
    open_count: 85,
    click_count: 42
  },
  {
    campaign_id: "campaign-3",
    campaign_name: "Spring Promotion",
    date: "2025-03-15",
    sent_count: 156,
    open_count: 95,
    click_count: 58
  }
];

export const useEmailMarketing = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [analytics, setAnalytics] = useState<EmailAnalytic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isConfigured: isSendgridConfigured } = useSendgridEmail();

  useEffect(() => {
    // Simulate API loading
    const loadData = async () => {
      setIsLoading(true);
      try {
        // In a real app, these would be API calls
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setTemplates(dummyTemplates);
        setCampaigns(dummyCampaigns);
        setAutomations(dummyAutomations);
        setAnalytics(dummyAnalytics);
      } catch (error) {
        console.error("Error loading email marketing data:", error);
        toast({
          title: "Error loading data",
          description: "Failed to load email marketing data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const createTemplate = async (templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newTemplate: EmailTemplate = {
        id: `template-${templates.length + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...templateData
      };
      
      setTemplates(prev => [...prev, newTemplate]);
      
      toast({
        title: "Template created",
        description: "Email template has been saved successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Error creating template",
        description: "Failed to save the email template",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createCampaign = async (campaignData: Omit<EmailCampaign, 'id' | 'created_at' | 'status' | 'recipient_count' | 'open_rate' | 'click_rate' | 'sent_at'>): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newCampaign: EmailCampaign = {
        id: `campaign-${campaigns.length + 1}`,
        created_at: new Date().toISOString(),
        status: campaignData.sendImmediately ? "sending" : "scheduled",
        recipient_count: campaignData.audienceType === "all" ? 150 : 45, // Simulated counts
        open_rate: 0,
        click_rate: 0,
        ...campaignData
      };
      
      setCampaigns(prev => [...prev, newCampaign]);
      
      toast({
        title: "Campaign created",
        description: campaignData.sendImmediately 
          ? "Email campaign is being sent" 
          : "Email campaign has been scheduled",
      });
      
      return true;
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error creating campaign",
        description: "Failed to create the email campaign",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createAutomation = async (automationData: Omit<EmailAutomation, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newAutomation: EmailAutomation = {
        id: `auto-${automations.length + 1}`,
        created_at: new Date().toISOString(),
        ...automationData
      };
      
      setAutomations(prev => [...prev, newAutomation]);
      
      toast({
        title: "Automation created",
        description: "Email automation has been set up successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error creating automation:", error);
      toast({
        title: "Error creating automation",
        description: "Failed to create the email automation",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestEmail = async (
    recipients: string[],
    options: { subject: string; content: string; note?: string }
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      // Simulate sending test email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!isSendgridConfigured) {
        return {
          success: false,
          message: "SendGrid is not configured. Cannot send test email."
        };
      }
      
      toast({
        title: "Test email sent",
        description: `Test email sent to ${recipients.length} recipients`
      });
      
      return {
        success: true,
        message: `Test email sent to ${recipients.join(", ")}`
      };
    } catch (error) {
      console.error("Error sending test email:", error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error sending test email"
      };
    }
  };

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
    isEmailConfigured: isSendgridConfigured
  };
};
