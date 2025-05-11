
// Email Template types
export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  subject: string;
  content: string;
  category: "service" | "promotion" | "newsletter" | "reminder" | "other";
  created_at: string;
  updated_at: string;
}

// Email Campaign types
export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content?: string;
  template_id?: string;
  scheduled_for?: string;
  sent_at?: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  recipient_segments?: string[];
  recipient_count: number;
  open_rate?: number;
  click_rate?: number;
  audienceType: "all" | "segment";
  segmentIds?: string[];
  sendImmediately: boolean;
  created_at: string;
}

// Email Automation types
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
  status: "active" | "inactive" | "draft";
  created_at: string;
  updated_at?: string;
  last_run?: string;
  next_run?: string;
}

// Email Analytics types
export interface EmailAnalytic {
  campaign_id: string;
  campaign_name: string;
  date: string;
  sent_count: number;
  open_count: number;
  click_count: number;
}

// Component Props
export interface EmailTemplateListProps {
  templates: EmailTemplate[];
  isLoading: boolean;
  onSave: (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
}

export interface EmailCampaignBuilderProps {
  templates: EmailTemplate[];
  onSave: (campaign: Omit<EmailCampaign, 'id' | 'created_at' | 'status' | 'recipient_count' | 'open_rate' | 'click_rate' | 'sent_at'>) => Promise<boolean>;
}

export interface EmailCampaignHistoryProps {
  campaigns: EmailCampaign[];
  isLoading: boolean;
}

export interface EmailAutomationsProps {
  automations: EmailAutomation[];
  templates: EmailTemplate[];
  isLoading: boolean;
  onSave: (automation: Omit<EmailAutomation, 'id' | 'created_at'>) => Promise<boolean>;
}

export interface EmailAnalyticsProps {
  analytics: EmailAnalytic[];
  isLoading: boolean;
}
