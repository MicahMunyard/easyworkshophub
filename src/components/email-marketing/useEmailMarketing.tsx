
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSendgridEmail } from '@/hooks/email/useSendgridEmail';
import { useCustomers } from '@/hooks/customers/useCustomers';
import { CustomerType } from '@/types/customer';
import { EmailTemplate, EmailCampaign, EmailAutomation, EmailAnalytics } from './types';

export function useEmailMarketing() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [analytics, setAnalytics] = useState<EmailAnalytics>({
    totalSent: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
    campaignPerformance: [],
    emailTimeline: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const { toast } = useToast();
  const { customers } = useCustomers();
  const { sendMarketingCampaign, isConfigured, isSending } = useSendgridEmail();

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
              createdAt: new Date().toISOString()
            },
            {
              id: "template-2",
              name: "Service Reminder",
              subject: "Time for your vehicle service",
              content: "<h1>Service Reminder</h1><p>It's time to schedule your next service appointment.</p>",
              createdAt: new Date().toISOString()
            }
          ];
          setTemplates(defaultTemplates);
          localStorage.setItem('emailTemplates', JSON.stringify(defaultTemplates));
        }
        
        // Mock analytics data
        setAnalytics({
          totalSent: 248,
          openRate: 42.3,
          clickRate: 12.8,
          bounceRate: 2.1,
          campaignPerformance: [
            { name: 'Winter Special', sent: 120, opened: 65, clicked: 28 },
            { name: 'New Year Offer', sent: 85, opened: 32, clicked: 15 },
            { name: 'Service Reminder', sent: 43, opened: 27, clicked: 12 }
          ],
          emailTimeline: [
            { date: '2025-01-01', sent: 18, opened: 12 },
            { date: '2025-02-01', sent: 27, opened: 15 },
            { date: '2025-03-01', sent: 32, opened: 20 },
            { date: '2025-04-01', sent: 45, opened: 24 },
            { date: '2025-05-01', sent: 58, opened: 31 }
          ]
        });
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
  }, [toast]);

  /**
   * Create a new email campaign
   */
  const createCampaign = async (campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'status'>): Promise<boolean> => {
    try {
      // Create new campaign object
      const newCampaign: EmailCampaign = {
        ...campaign,
        id: `campaign-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'scheduled'
      };
      
      // Save to local storage
      const updatedCampaigns = [...campaigns, newCampaign];
      setCampaigns(updatedCampaigns);
      localStorage.setItem('emailCampaigns', JSON.stringify(updatedCampaigns));
      
      // If campaign is set to send now, send it using SendGrid
      if (campaign.sendImmediately) {
        await sendCampaignNow(newCampaign);
      }
      
      toast({
        title: "Campaign created",
        description: campaign.sendImmediately 
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
      
      if (campaign.audienceType === 'all') {
        // Send to all customers with email
        recipientList = customers
          .filter(customer => customer.email)
          .map(customer => ({ 
            email: customer.email as string,
            name: customer.name
          }));
      } else if (campaign.audienceType === 'segment' && campaign.segmentIds) {
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
      let emailContent = campaign.content;
      let emailSubject = campaign.subject;
      
      if (campaign.templateId) {
        const template = templates.find(t => t.id === campaign.templateId);
        if (template) {
          emailContent = template.content;
          if (!emailSubject) emailSubject = template.subject;
        }
      }
      
      // Send campaign via SendGrid
      const result = await sendMarketingCampaign(
        recipientList,
        {
          to: recipientList, // SendGrid handles the multiple recipients
          subject: emailSubject,
          html: emailContent,
          categories: ['marketing', 'campaign']
        }
      );
      
      if (result.success) {
        // Update campaign status
        const updatedCampaigns = campaigns.map(c => 
          c.id === campaign.id ? { ...c, status: 'sent' } : c
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
  const createTemplate = (template: Omit<EmailTemplate, 'id' | 'createdAt'>): boolean => {
    try {
      // Create new template object
      const newTemplate: EmailTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        createdAt: new Date().toISOString()
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
  const createAutomation = (automation: Omit<EmailAutomation, 'id' | 'createdAt'>): boolean => {
    try {
      // Create new automation object
      const newAutomation: EmailAutomation = {
        ...automation,
        id: `automation-${Date.now()}`,
        createdAt: new Date().toISOString()
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
