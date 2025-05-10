import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSendgridEmail } from '@/hooks/email/useSendgridEmail';
import { useCustomers } from '@/hooks/customers/useCustomers';
import { EmailTemplate, EmailCampaign, EmailAutomation, EmailAnalytic } from './types';

export function useEmailMarketing() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [analytics, setAnalytics] = useState<EmailAnalytic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const { toast } = useToast();
  const { customers } = useCustomers();
  const { sendMarketingCampaign, isConfigured, isSending, getAnalytics } = useSendgridEmail();

  useEffect(() => {
    // Fetch data from local storage or API
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, this would fetch from an API
        // For now, we're loading from localStorage or using defaults
        const storedTemplates = localStorage.getItem('emailTemplates');
        const storedCampaigns = localStorage.getItem('emailCampaigns');
        const storedAutomations = localStorage.getItem('emailAutomations');
        
        if (storedTemplates) setTemplates(JSON.parse(storedTemplates));
        if (storedCampaigns) setCampaigns(JSON.parse(storedCampaigns));
        if (storedAutomations) setAutomations(JSON.parse(storedAutomations));
        
        // Default templates if none exist
        if (!storedTemplates) {
          const defaultTemplates: EmailTemplate[] = [
            {
              id: "template-1",
              name: "Welcome Email",
              subject: "Welcome to our Workshop!",
              content: "<h1>Welcome!</h1><p>Thank you for choosing our workshop for your vehicle needs.</p>",
              created_at: new Date().toISOString()
            },
            {
              id: "template-2",
              name: "Service Reminder",
              subject: "Time for your vehicle service",
              content: "<h1>Service Reminder</h1><p>It's time to schedule your next service appointment.</p>",
              created_at: new Date().toISOString()
            }
          ];
          setTemplates(defaultTemplates);
          localStorage.setItem('emailTemplates', JSON.stringify(defaultTemplates));
        }
        
        // Fetch analytics data from SendGrid if configured
        if (isConfigured) {
          try {
            const analyticsData = await getAnalytics();
            setAnalytics(analyticsData);
          } catch (error) {
            console.error('Error fetching analytics:', error);
            
            // Use mock data if API fails
            setAnalytics([
              { 
                campaign_id: "camp-1", 
                campaign_name: "Winter Special", 
                date: "2025-01-15", 
                sent_count: 120, 
                open_count: 65, 
                click_count: 28 
              },
              { 
                campaign_id: "camp-2", 
                campaign_name: "New Year Offer", 
                date: "2025-02-01", 
                sent_count: 85, 
                open_count: 32, 
                click_count: 15 
              },
              { 
                campaign_id: "camp-3", 
                campaign_name: "Service Reminder", 
                date: "2025-03-01", 
                sent_count: 43, 
                open_count: 27, 
                click_count: 12 
              },
              { 
                campaign_id: "camp-4", 
                campaign_name: "Spring Promotion", 
                date: "2025-04-01", 
                sent_count: 100, 
                open_count: 55, 
                click_count: 23 
              },
              { 
                campaign_id: "camp-5", 
                campaign_name: "Summer Service", 
                date: "2025-05-01", 
                sent_count: 80, 
                open_count: 48, 
                click_count: 18 
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Error loading email marketing data:', error);
        toast({
          title: "Error loading data",
          description: "Could not load email marketing data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast, isConfigured, getAnalytics]);

  /**
   * Create a new email campaign
   */
  const createCampaign = async (campaign: Omit<EmailCampaign, 'id' | 'created_at' | 'status' | 'recipient_count' | 'open_rate' | 'click_rate' | 'sent_at'>): Promise<boolean> => {
    try {
      // Create new campaign object
      const newCampaign: EmailCampaign = {
        ...campaign,
        id: `campaign-${Date.now()}`,
        created_at: new Date().toISOString(),
        status: 'scheduled',
        recipient_count: 0, // Will be set when sending
        audienceType: campaign.recipient_segments?.includes('all') ? 'all' : 'segment',
        sendImmediately: !campaign.scheduled_for
      };
      
      // Save to local storage
      const updatedCampaigns = [...campaigns, newCampaign];
      setCampaigns(updatedCampaigns);
      localStorage.setItem('emailCampaigns', JSON.stringify(updatedCampaigns));
      
      // If campaign is set to send now, send it using SendGrid
      if (!campaign.scheduled_for) {
        await sendCampaignNow(newCampaign);
      }
      
      toast({
        title: "Campaign created",
        description: !campaign.scheduled_for 
          ? "Your campaign has been sent" 
          : "Your campaign has been scheduled"
      });
      
      return true;
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error creating campaign",
        description: "Failed to create email campaign",
        variant: "destructive"
      });
      return false;
    }
  };

  /**
   * Send a campaign immediately using SendGrid
   */
  const sendCampaignNow = async (campaign: EmailCampaign): Promise<boolean> => {
    // Check if SendGrid is configured
    if (!isConfigured) {
      toast({
        title: "SendGrid not configured",
        description: "Email sending is not available. Please configure SendGrid API key.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      // Get campaign recipients from selected audience
      let recipientList = [];
      
      if (campaign.audienceType === 'all' || (campaign.recipient_segments && campaign.recipient_segments.includes('all'))) {
        // Send to all customers with email
        recipientList = customers
          .filter(customer => customer.email)
          .map(customer => ({ 
            email: customer.email as string,
            name: customer.name
          }));
      } else if ((campaign.audienceType === 'segment' && campaign.segmentIds) || 
                (campaign.recipient_segments && campaign.recipient_segments.length > 0)) {
        // Filter by customer segments
        // This is simplified - in a real app, you'd have a proper segment system
        recipientList = customers
          .filter(customer => customer.email)
          .slice(0, 10) // Just take first 10 as an example
          .map(customer => ({
            email: customer.email as string,
            name: customer.name
          }));
      }
      
      // Get template content if using a template
      let emailContent = campaign.content || '';
      let emailSubject = campaign.subject;
      
      if (campaign.template_id) {
        const template = templates.find(t => t.id === campaign.template_id);
        if (template) {
          emailContent = template.content;
          if (!emailSubject) emailSubject = template.subject;
        }
      }
      
      // Send campaign via SendGrid
      const result = await sendMarketingCampaign(
        recipientList,
        {
          to: recipientList.map(r => r.email), // Convert to array of strings for SendgridEmailOptions
          subject: emailSubject,
          html: emailContent,
          categories: ['marketing', 'campaign']
        }
      );
      
      if (result.success) {
        // Update campaign status
        const updatedCampaigns = campaigns.map(c => 
          c.id === campaign.id ? { ...c, status: 'sent' as const } : c
        );
        setCampaigns(updatedCampaigns);
        localStorage.setItem('emailCampaigns', JSON.stringify(updatedCampaigns));
        
        return true;
      } else {
        console.error('Failed to send campaign:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      return false;
    }
  };

  /**
   * Create a new email template
   */
  const createTemplate = async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      // Create new template object
      const newTemplate: EmailTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      
      // Save to local storage
      const updatedTemplates = [...templates, newTemplate];
      setTemplates(updatedTemplates);
      localStorage.setItem('emailTemplates', JSON.stringify(updatedTemplates));
      
      toast({
        title: "Template created",
        description: "Your email template has been saved"
      });
      
      return true;
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error creating template",
        description: "Failed to create email template",
        variant: "destructive"
      });
      return false;
    }
  };

  /**
   * Create a new email automation
   */
  const createAutomation = async (automation: Omit<EmailAutomation, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      // Create new automation object
      const newAutomation: EmailAutomation = {
        ...automation,
        id: `automation-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      
      // Save to local storage
      const updatedAutomations = [...automations, newAutomation];
      setAutomations(updatedAutomations);
      localStorage.setItem('emailAutomations', JSON.stringify(updatedAutomations));
      
      toast({
        title: "Automation created",
        description: "Your email automation has been set up"
      });
      
      return true;
    } catch (error) {
      console.error('Error creating automation:', error);
      toast({
        title: "Error creating automation",
        description: "Failed to create email automation",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    campaigns,
    templates,
    automations,
    analytics,
    isLoading: isLoading || isSending,
    createCampaign,
    createTemplate,
    createAutomation,
    sendCampaignNow,
    isEmailConfigured: isConfigured
  };
}
