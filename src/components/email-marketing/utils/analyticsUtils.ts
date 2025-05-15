
import type { EmailAnalytic } from "../types.d";

/**
 * Calculate open rate as a percentage from analytics data
 * @param analytics Array of email analytics data
 * @returns Formatted open rate percentage as string
 */
export const calculateOpenRate = (analytics: EmailAnalytic[]): string => {
  const totalSent = analytics.reduce((sum, item) => sum + item.recipients, 0);
  const totalOpens = analytics.reduce((sum, item) => sum + item.opens, 0);
  
  return totalSent ? (totalOpens / totalSent * 100).toFixed(1) : "0.0";
};

/**
 * Calculate click rate as a percentage from analytics data
 * @param analytics Array of email analytics data
 * @returns Formatted click rate percentage as string
 */
export const calculateClickRate = (analytics: EmailAnalytic[]): string => {
  const totalOpens = analytics.reduce((sum, item) => sum + item.opens, 0);
  const totalClicks = analytics.reduce((sum, item) => sum + item.clicks, 0);
  
  return totalOpens ? (totalClicks / totalOpens * 100).toFixed(1) : "0.0";
};

/**
 * Calculate total sent emails from analytics data
 * @param analytics Array of email analytics data
 * @returns Total number of sent emails
 */
export const calculateTotalSent = (analytics: EmailAnalytic[]): number => {
  return analytics.reduce((sum, item) => sum + item.recipients, 0);
};

/**
 * Calculate total opens from analytics data
 * @param analytics Array of email analytics data
 * @returns Total number of email opens
 */
export const calculateTotalOpens = (analytics: EmailAnalytic[]): number => {
  return analytics.reduce((sum, item) => sum + item.opens, 0);
};

/**
 * Calculate total clicks from analytics data
 * @param analytics Array of email analytics data
 * @returns Total number of email clicks
 */
export const calculateTotalClicks = (analytics: EmailAnalytic[]): number => {
  return analytics.reduce((sum, item) => sum + item.clicks, 0);
};

export interface ChartData {
  name: string;
  value?: number;
  openRate?: number;
  clickRate?: number;
  sent?: number;
  opened?: number;
  clicked?: number;
}

/**
 * Prepare data for engagement charts
 * @param analytics Array of email analytics data
 * @returns Formatted data for engagement charts
 */
export const prepareEngagementData = (analytics: EmailAnalytic[]): ChartData[] => {
  return [
    { name: "Sent", value: calculateTotalSent(analytics) },
    { name: "Opened", value: calculateTotalOpens(analytics) },
    { name: "Clicked", value: calculateTotalClicks(analytics) }
  ];
};

/**
 * Prepare data for campaign performance charts
 * @param analytics Array of email analytics data
 * @returns Formatted data for campaign performance charts
 */
export const prepareCampaignPerformanceData = (analytics: EmailAnalytic[]): ChartData[] => {
  return analytics.map(campaign => {
    const openRate = (campaign.opens / campaign.recipients * 100).toFixed(1);
    const openRateNum = parseFloat(openRate);
    
    const clickRate = campaign.opens ? (campaign.clicks / campaign.opens * 100).toFixed(1) : "0.0";
    const clickRateNum = parseFloat(clickRate);
    
    return {
      name: campaign.campaign_name,
      openRate: openRateNum,
      clickRate: clickRateNum
    };
  });
};

/**
 * Prepare data for campaign timeline charts
 * @param analytics Array of email analytics data
 * @returns Formatted data for timeline charts
 */
export const prepareCampaignTimelineData = (analytics: EmailAnalytic[]): ChartData[] => {
  return analytics.map(campaign => {
    const date = new Date(campaign.sent_date).toLocaleDateString();
    return {
      name: date,
      sent: campaign.recipients,
      opened: campaign.opens,
      clicked: campaign.clicks
    };
  });
};
