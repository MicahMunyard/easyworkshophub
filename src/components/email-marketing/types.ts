
export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content?: string;
  template_id?: string | null;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  audience_type: "all" | "segment" | "list" | "tag";
  segment_ids?: string[];
  recipient_count: number;
  open_rate?: number;
  click_rate?: number;
  scheduled_for?: string;
  sent_at?: string;
  created_at: string;
  updated_at?: string;
  send_immediately?: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  html?: string;
  design?: string;
  created_at?: string;
  updated_at?: string;
  category?: "service" | "promotion" | "newsletter" | "reminder" | "other";
  description?: string;
}

export interface EmailCampaignBuilderProps {
  templates: EmailTemplate[];
  onSave: (campaign: Omit<EmailCampaign, "id" | "created_at" | "status" | "recipient_count" | "open_rate" | "click_rate" | "sent_at" | "updated_at">) => Promise<boolean>;
}

export interface EmailCampaignHistoryProps {
  campaigns: EmailCampaign[];
  isLoading: boolean;
}

export interface EmailAnalytic {
  campaign_id: string;
  campaign_name: string;
  sent_date: string;
  recipients: number;
  opens: number;
  clicks: number;
  sent_count?: number;
  open_count?: number;
  click_count?: number;
  date?: string;
}

export interface SendgridFormValues {
  apiKey: string;
  fromName: string;
  fromEmail: string;
  senderName?: string;
  senderEmail?: string;
  replyToEmail?: string;
  enableTracking?: boolean;
  enableUnsubscribeFooter?: boolean;
  isConfigured?: boolean;
}

export interface SendgridConfigProps {
  isConfigured?: boolean;
  onSave?: (values: SendgridFormValues) => Promise<boolean>;
  onTest?: () => Promise<boolean>;
  onSaveConfig?: (config: SendgridFormValues) => Promise<boolean>;
  onTestConnection?: (config?: SendgridFormValues) => Promise<{success: boolean; message: string}>;
  existingConfig?: SendgridFormValues | null;
}

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
  is_active: boolean;
  audience_type: "all" | "segment";
  segment_ids?: string[];
  status: "active" | "paused" | "draft";
  created_at: string;
  updated_at?: string;
  last_run?: string;
  next_run?: string;
  frequency?: "daily" | "weekly" | "monthly" | "custom";
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendgridEmailOptions {
  to: string | EmailRecipient;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  success: boolean;
  message?: string;
  error?: Error;
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

export interface EmailTestingProps {
  emailSubject: string;
  emailContent: string;
  onSendTest: (recipients: string[], options: any) => Promise<{ success: boolean; message?: string }>;
  isSubmitting: boolean;
}

export interface EnhancedEmailAnalyticsProps {
  analytics: EmailAnalytic[];
  isLoading: boolean;
  exportAnalytics: () => void;
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
