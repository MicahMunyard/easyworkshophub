
export interface EmailAnalytic {
  campaign_id: string;
  campaign_name: string;
  date: string;
  sent_count: number;
  open_count: number;
  click_count: number;
  bounce_count?: number;
}

export interface EmailAnalyticsProps {
  analytics: EmailAnalytic[];
  isLoading: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  subject: string;
  content: string;
  category?: 'service' | 'promotion' | 'newsletter' | 'reminder' | 'other';
  created_at: string;
  updated_at?: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content?: string;
  template_id?: string;
  recipient_segments?: string[];
  scheduled_for?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipient_count: number;
  open_rate?: number;
  click_rate?: number;
  created_at: string;
  sent_at?: string;
  audienceType?: 'all' | 'segment';
  segmentIds?: string[];
  sendImmediately?: boolean;
  from_email?: string;
}

export interface EmailAutomation {
  id: string;
  name: string;
  description?: string;
  template_id: string;
  trigger: 'service_reminder' | 'birthday' | 'service_completed' | 'after_purchase' | 'other';
  status: 'active' | 'inactive';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  created_at: string;
}

// Props interfaces for components
export interface EmailCampaignBuilderProps {
  templates: EmailTemplate[];
  onSave: (campaign: Partial<EmailCampaign>) => Promise<boolean>;
}

export interface EmailTemplateListProps {
  templates: EmailTemplate[];
  isLoading: boolean;
  onSave: (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
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
