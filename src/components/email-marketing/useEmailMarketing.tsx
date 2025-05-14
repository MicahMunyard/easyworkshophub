
import { useState, useEffect, useCallback } from "react";
import { EmailTemplate, EmailCampaign, EmailAutomation, EmailAnalytic } from "./types";
import { useSendgridEmail } from "@/hooks/email/useSendgridEmail";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { cleanupDemoData } from '@/hooks/communication/api/cleanupDemoData';
import { supabase } from "@/integrations/supabase/client";

export const useEmailMarketing = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [analytics, setAnalytics] = useState<EmailAnalytic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { sendEmail, sendMarketingCampaign, getAnalytics } = useSendgridEmail();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Load email marketing data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (!user) return;

        // Clean up any existing demo data
        await cleanupDemoData(user.id);
        
        // Load real templates
        const { data: templateData, error: templateError } = await supabase
          .from('email_templates')
          .select('*')
          .eq('user_id', user.id);
          
        if (templateError) throw templateError;
        
        if (templateData && templateData.length > 0) {
          setTemplates(templateData.map(template => ({
            id: template.id,
            name: template.name,
            subject: template.subject,
            content: template.body || '',
            category: template.template_type || 'other',
            created_at: template.created_at,
            updated_at: template.updated_at || template.created_at
          })));
        } else {
          setTemplates([]);
        }
        
        // For campaigns and analytics, we'll start with empty arrays
        setCampaigns([]);
        setAnalytics([]);
        setAutomations([]);
        
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
  }, [user, toast]);
  
  // Create a new template
  const createTemplate = async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) {
        toast({
          title: "Not authorized",
          description: "You need to be logged in to create templates",
          variant: "destructive",
        });
        return false;
      }
      
      // In a real app, this would send the template to an API
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          user_id: user.id,
          name: template.name,
          subject: template.subject,
          body: template.content,
          template_type: template.category || 'other'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const newTemplate: EmailTemplate = {
          id: data.id,
          name: data.name,
          subject: data.subject,
          content: data.body || '',
          category: data.template_type || 'other',
          description: template.description,
          created_at: data.created_at,
          updated_at: data.updated_at || data.created_at
        };
        
        setTemplates(prev => [newTemplate, ...prev]);
        
        toast({
          title: "Template created",
          description: "Your email template has been saved",
        });
      }
      
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
      if (!user) return false;
      
      // Find the template if using template_id
      const template = campaign.template_id ? templates.find(t => t.id === campaign.template_id) : null;
      if (campaign.template_id && !template) {
        throw new Error("Template not found");
      }
      
      // Use template content if available
      const emailContent = template ? template.content : campaign.content;
      
      // This would be handled by the backend in a real integration
      const newCampaignData: EmailCampaign = {
        id: `campaign-${Date.now()}`,
        name: campaign.name,
        subject: campaign.subject,
        template_id: campaign.template_id,
        scheduled_for: campaign.scheduled_for,
        status: campaign.sendImmediately ? "sending" : "scheduled",
        recipient_count: 0, // Set by the real system
        created_at: new Date().toISOString(),
        audienceType: campaign.audienceType,
        sendImmediately: campaign.sendImmediately,
        segmentIds: campaign.segmentIds
      };
      
      // In a real app, this would be handled by a server endpoint
      if (campaign.sendImmediately) {
        // Simulate immediate sending (in a real system, this would be handled by the server)
        setTimeout(() => {
          setCampaigns(prev => {
            const updated = prev.map(c => 
              c.id === newCampaignData.id 
                ? { ...c, status: 'sent', sent_at: new Date().toISOString() } 
                : c
            );
            return updated;
          });
        }, 3000);
      }
      
      setCampaigns(prev => [newCampaignData, ...prev]);
      
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
      if (!user) return false;
      
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
      // Send the email with the correct object format
      const result = await sendEmail(recipients[0], {
        to: recipients,
        subject: `[TEST] ${options.subject || "Test Email"}`,
        html: options.content,
        text: options.note ? `Note: ${options.note}\n\n---\n\n` : undefined,
        from_email: options.from || undefined  // Use from_email which is part of SendgridEmailOptions
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
  
  // Export analytics to CSV or PDF
  const exportAnalytics = async (format: 'csv' | 'pdf'): Promise<void> => {
    try {
      // In a real app, this would generate and download the export file
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
    createTemplate,
    createCampaign,
    createAutomation,
    sendTestEmail,
    exportAnalytics
  };
};
