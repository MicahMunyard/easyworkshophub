
export interface SendgridFormValues {
  apiKey: string;
  fromName: string;
  fromEmail: string;
  senderName: string;
  senderEmail: string;
  replyToEmail?: string;
  enableTracking: boolean;
  enableUnsubscribeFooter: boolean;
  isConfigured?: boolean;
}

export interface SendgridConfigProps {
  onSaveConfig?: (config: SendgridFormValues) => Promise<boolean>;
  onTestConnection?: () => Promise<{ success: boolean; message: string }>;
  existingConfig?: SendgridFormValues;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: "service" | "promotion" | "newsletter" | "reminder" | "other";
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content?: string;
  template_id?: string | null;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  audience_type: "all" | "segment";
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

export interface EmailAutomation {
  id: string;
  name: string;
  description?: string;
  trigger_type: "event" | "schedule" | "segment";
  trigger_details?: any;
  template_id: string;
  is_active: boolean;
  audience_type: "all" | "segment";
  segment_ids?: string[];
  status: "active" | "paused" | "draft";
  created_at: string;
  next_run?: string;
  frequency?: "daily" | "weekly" | "monthly" | "custom";
}

export interface EmailAnalytic {
  campaign_id: string;
  campaign_name: string;
  sent_date: string;
  recipients: number;
  opens: number;
  clicks: number;
}

export interface EmailCampaignBuilderProps {
  templates: EmailTemplate[];
  onSave: (campaign: Omit<EmailCampaign, "id" | "created_at" | "status" | "recipient_count" | "open_rate" | "click_rate" | "sent_at" | "updated_at">) => Promise<boolean>;
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
