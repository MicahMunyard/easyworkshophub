
// If this file already exists, add these interfaces/types to it

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  description?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipient_count: number;
  open_rate?: number;
  click_rate?: number;
  scheduled_for?: string | null;
  sent_at?: string | null;
  created_at: string;
}

export interface EmailAnalytic {
  campaign_id: string;
  campaign_name: string;
  sent_count: number;
  open_count: number;
  click_count: number;
  date: string;
}

export interface EmailTemplateListProps {
  templates: EmailTemplate[];
  isLoading: boolean;
  onSave: (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  onTestEmail?: (recipients: string[], options: any) => Promise<{ success: boolean; message?: string }>;
}

export interface EmailCampaignBuilderProps {
  templates: EmailTemplate[];
  onSave: (campaign: Omit<EmailCampaign, 'id' | 'created_at'>) => Promise<boolean>;
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
