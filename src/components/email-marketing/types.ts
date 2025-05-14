
// Email marketing types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content?: string;
  template_id?: string;
  scheduled_for?: string;
  sent_at?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  recipient_count: number;
  open_rate?: number;
  click_rate?: number;
  created_at: string;
  audience_type: 'all' | 'segment';
  send_immediately?: boolean;
  segment_ids?: string[];
}

export interface EmailAutomation {
  id: string;
  name: string;
  description?: string;
  trigger_type: 'schedule' | 'event';
  trigger_details: {
    schedule?: string;
    event?: string;
    parameters?: Record<string, any>;
  };
  template_id: string;
  status: 'active' | 'paused' | 'draft';
  created_at: string;
  next_run?: string;
  last_run?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
  updated_at?: string;
}

export interface EmailAnalytic {
  id: string;
  campaign_id: string;
  campaign_name: string;
  sent_date: string;
  recipients: number;
  opens: number;
  clicks: number;
  bounces: number;
  spam_reports: number;
  unsubscribes: number;
  sent_count?: number;
  open_count?: number;
  click_count?: number;
  date?: string;
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

export interface EmailAnalyticsProps {
  analytics: EmailAnalytic[];
  isLoading: boolean;
  exportAnalytics?: (format: 'csv' | 'pdf') => Promise<void>;
}

export interface EmailAutomationProps {
  automations: EmailAutomation[];
  templates: EmailTemplate[];
  isLoading: boolean;
  onSave: (automation: Omit<EmailAutomation, 'id' | 'created_at'>) => Promise<boolean>;
}

export interface EmailDesignerProps {
  initialTemplate?: {
    name: string;
    subject: string;
    content: string;
  };
  onSave: (template: { name: string; subject: string; content: string }) => Promise<boolean>;
  mode: 'template' | 'campaign';
  onCancel?: () => void;
}

export interface EmailTestingProps {
  emailSubject: string;
  emailContent: string;
  onSendTest: (recipients: string[], options: any) => Promise<{ success: boolean; message?: string }>;
  isSubmitting: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// SendGrid specific types
export interface SendgridEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from_email?: string;
  from_name?: string;
  reply_to?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
  template_id?: string;
  dynamic_template_data?: Record<string, any>;
  categories?: string[];
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

// Add the missing SendgridConfig related types
export interface SendgridFormValues {
  apiKey: string;
  senderName: string;
  senderEmail: string;
  replyToEmail?: string;
  enableTracking: boolean;
  enableUnsubscribeFooter: boolean;
}

export interface SendgridConfigProps {
  onSaveConfig: (data: SendgridFormValues) => Promise<boolean>;
  onTestConnection: () => Promise<{ success: boolean; message: string }>;
  existingConfig?: SendgridFormValues & { isConfigured?: boolean };
}
