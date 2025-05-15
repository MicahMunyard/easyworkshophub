
// Email Template Types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category?: "service" | "promotion" | "newsletter" | "reminder" | "other";
  description?: string;
  created_at: string;
  updated_at?: string;
  is_default?: boolean;
  html?: string;
  design?: string;
}

// Email Campaign Types
export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content?: string;
  template_id?: string | null;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  audience_type: "all" | "segment" | "list" | "tag";
  audience_filter?: any;
  scheduled_for?: string;
  scheduled_at?: string;
  sent_at?: string;
  recipient_count: number;
  open_rate?: number;
  click_rate?: number;
  opens?: number;
  clicks?: number;
  created_at: string;
  updated_at?: string;
  send_immediately?: boolean;
}

// Email Automation Types
export interface EmailAutomation {
  id: string;
  name: string;
  description?: string;
  trigger_type: "welcome" | "abandoned_cart" | "service_reminder" | "birthday" | "custom" | "schedule" | "event";
  trigger_details?: {
    event?: string;
    schedule?: string;
  };
  template_id: string;
  status?: "draft" | "active" | "inactive" | "completed";
  frequency?: "daily" | "weekly" | "monthly" | "custom";
  is_active: boolean;
  last_run?: string;
  next_run?: string;
  audience_type: "all" | "segment";
  segment_ids?: string[];
  created_at: string;
  updated_at?: string;
}

// Email Analytics Types
export interface EmailAnalytic {
  campaign_id: string;
  campaign_name: string;
  subject?: string;
  sent_date: string;
  sent_at?: string;
  recipients: number;
  opens: number;
  clicks: number;
  date?: string;
  sent_count?: number;
  open_count?: number;
  click_count?: number;
  unsubscribes?: number;
  bounces?: number;
  complaints?: number;
  id?: string;
}

// Email Recipient Type
export interface EmailRecipient {
  email: string;
  name?: string;
}

// Props Types for Components
export interface EmailCampaignBuilderProps {
  templates: EmailTemplate[];
  onSave: (campaign: Omit<EmailCampaign, "id" | "created_at" | "status" | "recipient_count" | "open_rate" | "click_rate" | "sent_at" | "updated_at">) => Promise<boolean>;
}

export interface EmailTemplateListProps {
  templates: EmailTemplate[];
  isLoading: boolean;
  onSave: (template: Omit<EmailTemplate, "id" | "created_at" | "updated_at">) => Promise<boolean>;
  onTestEmail?: (recipients: string[], options: any) => Promise<{ success: boolean; message?: string }>;
}

export interface EmailAnalyticsProps {
  analytics: EmailAnalytic[];
  isLoading: boolean;
}

export interface EmailAutomationProps {
  automations: EmailAutomation[];
  templates: EmailTemplate[];
  isLoading: boolean;
  onSave: (automation: Omit<EmailAutomation, "id" | "created_at">) => Promise<boolean>;
}

export interface EnhancedEmailAnalyticsProps {
  analytics: EmailAnalytic[];
  isLoading: boolean;
  exportAnalytics: () => void;
}

export interface TestEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId?: string;
  campaignSubject?: string;
  campaignName?: string;
  emailSubject?: string;
  emailContent?: string;
  onSendTest?: (recipients: string[], options: any) => Promise<{ success: boolean; message?: string }>;
  isSubmitting?: boolean;
}

// SendGrid Types
export interface SendgridConfigProps {
  isConfigured?: boolean;
  onSave?: (values: SendgridFormValues) => Promise<boolean>;
  onTest?: () => Promise<boolean>;
  onSaveConfig?: (config: SendgridFormValues) => Promise<boolean>;
  onTestConnection?: (config?: SendgridFormValues) => Promise<{success: boolean; message: string}>;
  existingConfig?: SendgridFormValues | null;
}

export interface SendgridFormValues {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  senderName?: string;
  senderEmail?: string;
  replyToEmail?: string;
  enableTracking?: boolean;
  enableUnsubscribeFooter?: boolean;
}

export interface SendgridEmailOptions {
  to?: string | string[] | EmailRecipient | EmailRecipient[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  from_name?: string;
  from_email?: string;
  replyTo?: string; 
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
  categories?: string[];
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

export interface SendEmailResult {
  success: boolean;
  error?: Error;
}
