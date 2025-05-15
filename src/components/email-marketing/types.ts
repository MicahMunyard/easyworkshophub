
export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content?: string;
  template_id?: string;
  scheduled_for?: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  recipient_count: number;
  open_rate?: number;
  click_rate?: number;
  sent_at?: string;
  created_at: string;
  audience_type: "all" | "segment" | "list" | "tag"; 
  segment_ids?: string[];
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
  onSave: (campaign: any) => Promise<boolean>;
}

export interface EmailCampaignHistoryProps {
  campaigns: EmailCampaign[];
  isLoading: boolean;
}

export interface EmailAnalytic {
  campaign_id: string;
  campaign_name: string;
  date: string;
  sent_count: number;
  open_count: number;
  click_count: number;
  sent_date?: string;
  recipients?: number;
  opens?: number;
  clicks?: number;
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

export interface SendgridConfigProps {
  isConfigured: boolean;
  onSave: (values: SendgridFormValues) => Promise<boolean>;
  onTest: () => Promise<boolean>;
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
  created_at: string;
  updated_at?: string;
  last_run?: string;
  next_run?: string;
  audience_type: "all" | "segment";
  segment_ids?: string[];
  frequency?: "daily" | "weekly" | "monthly" | "custom";
  status?: "draft" | "active" | "inactive" | "completed";
}
