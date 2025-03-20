
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  EmailCampaign, 
  EmailTemplate, 
  EmailAutomation, 
  EmailAnalytic 
} from "./types";

export function useEmailMarketing() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [analytics, setAnalytics] = useState<EmailAnalytic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmailData();
  }, []);

  async function fetchEmailData() {
    setIsLoading(true);
    try {
      // Mock data for templates
      const mockTemplates: EmailTemplate[] = [
        {
          id: "1",
          name: "Service Reminder",
          description: "Reminder for upcoming vehicle service",
          subject: "Your vehicle is due for service",
          content: "<p>Dear {{customer_name}},</p><p>This is a reminder that your {{vehicle}} is due for service on {{service_date}}.</p><p>Please contact us to confirm your appointment.</p><p>Regards,<br>{{workshop_name}}</p>",
          created_at: "2023-03-10T14:30:00Z",
          updated_at: "2023-03-15T09:45:00Z",
          category: "reminder"
        },
        {
          id: "2",
          name: "New Promotion",
          description: "Template for seasonal promotions",
          subject: "Special Offer Inside!",
          content: "<p>Dear {{customer_name}},</p><p>We're excited to offer you a special discount on {{service_type}} this month!</p><p>Book now and save 15% on your next service.</p><p>Offer valid until {{expiry_date}}.</p><p>Regards,<br>{{workshop_name}}</p>",
          created_at: "2023-02-28T11:20:00Z",
          updated_at: "2023-03-05T16:45:00Z",
          category: "promotion"
        },
        {
          id: "3",
          name: "Birthday Wishes",
          description: "Birthday greetings for customers",
          subject: "Happy Birthday from the team!",
          content: "<p>Dear {{customer_name}},</p><p>Happy Birthday from all of us at {{workshop_name}}!</p><p>As a token of our appreciation, we're giving you a 20% discount on your next service.</p><p>Regards,<br>{{workshop_name}}</p>",
          created_at: "2023-01-15T10:00:00Z",
          updated_at: "2023-01-20T13:15:00Z",
          category: "other"
        }
      ];
      
      // Mock data for campaigns
      const mockCampaigns: EmailCampaign[] = [
        {
          id: "1",
          name: "Spring Service Special",
          subject: "Get Your Vehicle Ready for Spring!",
          template_id: "2",
          status: "sent",
          recipient_count: 245,
          open_rate: 0.68,
          click_rate: 0.32,
          created_at: "2023-03-01T09:00:00Z",
          sent_at: "2023-03-02T10:30:00Z"
        },
        {
          id: "2",
          name: "Routine Maintenance Reminder",
          subject: "Your vehicle is due for service",
          template_id: "1",
          status: "scheduled",
          recipient_count: 180,
          created_at: "2023-03-10T14:30:00Z",
          scheduled_for: "2023-03-20T09:00:00Z"
        },
        {
          id: "3",
          name: "Customer Appreciation Month",
          subject: "We appreciate your business!",
          template_id: "2",
          status: "draft",
          recipient_count: 0,
          created_at: "2023-03-15T11:45:00Z"
        }
      ];
      
      // Mock data for automations
      const mockAutomations: EmailAutomation[] = [
        {
          id: "1",
          name: "Service Reminder Automation",
          description: "Sends service reminders 7 days before due date",
          template_id: "1",
          trigger: "service_reminder",
          status: "active",
          created_at: "2023-02-15T10:00:00Z",
          frequency: "once"
        },
        {
          id: "2",
          name: "Birthday Wishes",
          description: "Sends birthday wishes and special offers",
          template_id: "3",
          trigger: "birthday",
          status: "active",
          created_at: "2023-01-20T09:30:00Z",
          frequency: "yearly"
        },
        {
          id: "3",
          name: "After Service Follow-up",
          description: "Follows up after service completion",
          template_id: "2",
          trigger: "service_completed",
          status: "inactive",
          created_at: "2023-03-05T14:15:00Z",
          frequency: "once"
        }
      ];
      
      // Mock data for analytics
      const mockAnalytics: EmailAnalytic[] = [
        {
          campaign_id: "1",
          campaign_name: "Spring Service Special",
          sent_count: 245,
          open_count: 167,
          click_count: 78,
          date: "2023-03-02T10:30:00Z"
        },
        {
          campaign_id: "4",
          campaign_name: "Winter Tire Promotion",
          sent_count: 320,
          open_count: 192,
          click_count: 116,
          date: "2023-02-15T09:45:00Z"
        },
        {
          campaign_id: "5",
          campaign_name: "Year-End Newsletter",
          sent_count: 412,
          open_count: 298,
          click_count: 145,
          date: "2023-01-10T11:30:00Z"
        }
      ];

      setTemplates(mockTemplates);
      setCampaigns(mockCampaigns);
      setAutomations(mockAutomations);
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error("Error fetching email data:", error);
      toast({
        title: "Error",
        description: "Failed to load email marketing data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function createCampaign(campaignData: {
    name: string;
    subject: string;
    template_id: string;
    content: string;
    recipient_segments: string[];
    scheduled_for?: string;
  }) {
    try {
      // This would normally make a database call
      console.log("Creating campaign:", campaignData);
      
      const newCampaign: EmailCampaign = {
        id: String(Date.now()),
        name: campaignData.name,
        subject: campaignData.subject,
        template_id: campaignData.template_id,
        status: campaignData.scheduled_for ? 'scheduled' : 'draft',
        recipient_count: campaignData.recipient_segments.length * 50, // Mock count
        created_at: new Date().toISOString(),
        scheduled_for: campaignData.scheduled_for,
      };
      
      setCampaigns(prev => [newCampaign, ...prev]);
      
      toast({
        title: "Success",
        description: `Campaign "${campaignData.name}" has been ${campaignData.scheduled_for ? 'scheduled' : 'saved as draft'}.`,
      });
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive"
      });
    }
  }

  async function createTemplate(templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) {
    try {
      // This would normally make a database call
      console.log("Creating template:", templateData);
      
      const newTemplate: EmailTemplate = {
        id: String(Date.now()),
        ...templateData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setTemplates(prev => [newTemplate, ...prev]);
      
      toast({
        title: "Success",
        description: `Template "${templateData.name}" has been created.`,
      });
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive"
      });
    }
  }

  async function createAutomation(automationData: Omit<EmailAutomation, 'id' | 'created_at'>) {
    try {
      // This would normally make a database call
      console.log("Creating automation:", automationData);
      
      const newAutomation: EmailAutomation = {
        id: String(Date.now()),
        ...automationData,
        created_at: new Date().toISOString(),
      };
      
      setAutomations(prev => [newAutomation, ...prev]);
      
      toast({
        title: "Success",
        description: `Automation "${automationData.name}" has been created.`,
      });
    } catch (error) {
      console.error("Error creating automation:", error);
      toast({
        title: "Error",
        description: "Failed to create automation. Please try again.",
        variant: "destructive"
      });
    }
  }

  return {
    campaigns,
    templates,
    automations,
    analytics,
    isLoading,
    createCampaign,
    createTemplate,
    createAutomation
  };
}
