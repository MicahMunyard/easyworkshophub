
// Email marketing types

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  description?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipient_count: number;
  open_rate?: number;
  click_rate?: number;
  scheduled_for?: string | null;
  sent_at?: string | null;
  created_at: string;
  audienceType?: string;
  sendImmediately?: boolean;
}

export interface EmailAnalytic {
  campaign_id: string;
  campaign_name: string;
  sent_count: number;
  open_count: number;
  click_count: number;
  date: string;
}

export interface EmailTemplateListProps {
  templates: EmailTemplate[];
  isLoading: boolean;
  onSave: (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  onTestEmail?: (recipients: string[], options: any) => Promise<{ success: boolean; message?: string }>;
}

export interface EmailCampaignBuilderProps {
  templates: EmailTemplate[];
  onSave: (campaign: Omit<EmailCampaign, 'id' | 'created_at' | 'status' | 'recipient_count' | 'open_rate' | 'click_rate' | 'sent_at'>) => Promise<boolean>;
}

export interface EmailCampaignHistoryProps {
  campaigns: EmailCampaign[];
  isLoading: boolean;
}

export interface EnhancedEmailAnalyticsProps {
  analytics: EmailAnalytic[];
  isLoading: boolean;
  exportAnalytics: () => void;
}

export interface SendgridEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;        // Keep this for backward compatibility
  from_name?: string;   // Standardized to match Edge Function
  from_email?: string;  // Standardized to match Edge Function
  replyTo?: string; 
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
  categories?: string[];
}

export interface EmailRecipient {
  email: string;
  name?: string;
}
