
export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  template_id: string;
  content?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipient_count: number;
  open_rate?: number;
  click_rate?: number;
  created_at: string;
  scheduled_for?: string;
  sent_at?: string;
  audienceType?: 'all' | 'segment';
  segmentIds?: string[];
  sendImmediately?: boolean;
  recipient_segments?: string[];
  from_email?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  category?: 'service' | 'promotion' | 'newsletter' | 'reminder' | 'other';
}

export interface EmailAutomation {
  id: string;
  name: string;
  description?: string;
  template_id: string;
  trigger: 'service_completed' | 'birthday' | 'service_reminder' | 'after_purchase' | 'other';
  status: 'active' | 'inactive';
  created_at: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'once';
}

export interface EmailAnalytic {
  campaign_id: string;
  campaign_name: string;
  sent_count: number;
  open_count: number;
  click_count: number;
  date: string;
}

export interface EmailAnalytics {
  totalSent: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  campaignPerformance: Array<{
    name: string;
    sent: number;
    opened: number;
    clicked: number;
  }>;
  emailTimeline: Array<{
    date: string;
    sent: number;
    opened: number;
  }>;
}

export interface EmailCampaignBuilderProps {
  templates: EmailTemplate[];
  onSave: (campaignData: Omit<EmailCampaign, 'id' | 'created_at' | 'status' | 'recipient_count' | 'open_rate' | 'click_rate' | 'sent_at'>) => Promise<boolean>;
}

export interface EmailTemplateListProps {
  templates: EmailTemplate[];
  isLoading: boolean;
  onSave: (templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
}

export interface EmailAutomationsProps {
  automations: EmailAutomation[];
  templates: EmailTemplate[];
  isLoading: boolean;
  onSave: (automationData: Omit<EmailAutomation, 'id' | 'created_at'>) => Promise<boolean>;
}

export interface EmailAnalyticsProps {
  analytics: EmailAnalytics;
  isLoading: boolean;
}

export interface EmailCampaignHistoryProps {
  campaigns: EmailCampaign[];
  isLoading: boolean;
}
