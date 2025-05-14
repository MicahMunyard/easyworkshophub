export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  template_id?: string;
  scheduled_for?: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  recipient_count: number;
  open_rate?: number;
  click_rate?: number;
  sent_at?: string;
  created_at: string;
  audience_type: "all" | "segment"; 
  segment_ids?: string[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html?: string;
  design?: string;
  created_at?: string;
  updated_at?: string;
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
}

export interface SendgridFormValues {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export interface SendgridConfigProps {
  isConfigured: boolean;
  onSave: (values: SendgridFormValues) => Promise<boolean>;
  onTest: () => Promise<boolean>;
}

export interface EmailAutomation {
  id: string;
  name: string;
  description?: string;
  trigger_type: "welcome" | "abandoned_cart" | "service_reminder" | "birthday" | "custom";
  template_id: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  last_run?: string;
  audience_type: "all" | "segment";
  segment_ids?: string[];
}
