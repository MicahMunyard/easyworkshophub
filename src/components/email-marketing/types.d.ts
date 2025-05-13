// Email marketing types

export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  subject: string;
  content: string;
  category: "service" | "promotion" | "newsletter" | "reminder" | "other";
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content?: string;
  template_id?: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  audience_type: "all" | "segment" | "tag" | "list";
  audience_filter?: any;
  scheduled_at?: string;
  sent_at?: string;
  opens?: number;
  clicks?: number;
  created_at: string;
  updated_at: string;
}

export interface EmailAutomation {
  id: string;
  name: string;
  description?: string;
  trigger_type: "event" | "schedule";
  trigger_details: {
    event?: string;
    schedule?: string;
  };
  template_id: string;
  status: "draft" | "active" | "inactive" | "completed";
  frequency: "daily" | "weekly" | "monthly" | "custom";
  last_run?: string;
  next_run?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailAnalytic {
  campaign_id: string;
  campaign_name: string;
  subject: string;
  sent_at: string;
  recipients: number;
  opens: number;
  clicks: number;
  unsubscribes: number;
  bounces: number;
  complaints: number;
}

export interface EmailAnalyticsProps {
  analytics: EmailAnalytic[];
  isLoading: boolean;
  exportAnalytics?: () => void;
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
