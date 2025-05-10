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
  analytics: {
    campaignPerformance: EmailAnalytic[];
    emailTimeline: EmailAnalytic[];
  };
  isLoading: boolean;
}
