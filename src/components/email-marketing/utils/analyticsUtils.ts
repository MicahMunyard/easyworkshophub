
import { EmailAnalytic } from "../types";

/**
 * Calculate open rate as a percentage from analytics data
 * @param analytics Array of email analytics data
 * @returns Formatted open rate percentage as string
 */
export const calculateOpenRate = (analytics: EmailAnalytic[]): string => {
  const totalSent = analytics.reduce((sum, item) => sum + item.sent_count, 0);
  const totalOpens = analytics.reduce((sum, item) => sum + item.open_count, 0);
  
  return totalSent ? (totalOpens / totalSent * 100).toFixed(1) : "0.0";
};

/**
 * Calculate click rate as a percentage from analytics data
 * @param analytics Array of email analytics data
 * @returns Formatted click rate percentage as string
 */
export const calculateClickRate = (analytics: EmailAnalytic[]): string => {
  const totalOpens = analytics.reduce((sum, item) => sum + item.open_count, 0);
  const totalClicks = analytics.reduce((sum, item) => sum + item.click_count, 0);
  
  return totalOpens ? (totalClicks / totalOpens * 100).toFixed(1) : "0.0";
};

/**
 * Calculate total sent emails
 * @param analytics Array of email analytics data
 * @returns Sum of sent emails
 */
export const calculateTotalSent = (analytics: EmailAnalytic[]): number => {
  return analytics.reduce((sum, item) => sum + item.sent_count, 0);
};

/**
 * Calculate total opened emails
 * @param analytics Array of email analytics data
 * @returns Sum of opened emails
 */
export const calculateTotalOpens = (analytics: EmailAnalytic[]): number => {
  return analytics.reduce((sum, item) => sum + item.open_count, 0);
};

/**
 * Calculate total clicked emails
 * @param analytics Array of email analytics data
 * @returns Sum of clicked emails
 */
export const calculateTotalClicks = (analytics: EmailAnalytic[]): number => {
  return analytics.reduce((sum, item) => sum + item.click_count, 0);
};

/**
 * Data structure for charts
 */
export interface ChartData {
  name: string;
  value?: number;
  sent?: number;
  opened?: number;
  clicked?: number;
  openRate?: number;
  clickRate?: number;
}

/**
 * Prepare data for email engagement funnel chart
 * @param analytics Array of email analytics data
 * @returns Formatted data for funnel chart
 */
export const prepareEngagementData = (analytics: EmailAnalytic[]): ChartData[] => {
  const totalSent = calculateTotalSent(analytics);
  const totalOpens = calculateTotalOpens(analytics);
  const totalClicks = calculateTotalClicks(analytics);
  
  return [
    { name: "Sent", value: totalSent },
    { name: "Opened", value: totalOpens },
    { name: "Clicked", value: totalClicks }
  ];
};

/**
 * Prepare data for campaign performance chart
 * @param analytics Array of email analytics data
 * @returns Formatted data for performance chart
 */
export const prepareCampaignPerformanceData = (analytics: EmailAnalytic[]): ChartData[] => {
  return analytics.map(item => ({
    name: item.campaign_name,
    openRate: parseFloat((item.open_count / item.sent_count * 100).toFixed(1)) || 0,
    clickRate: item.open_count > 0 
      ? parseFloat((item.click_count / item.open_count * 100).toFixed(1)) || 0
      : 0
  }));
};

/**
 * Prepare data for campaign timeline chart
 * @param analytics Array of email analytics data
 * @returns Formatted data for timeline chart
 */
export const prepareCampaignTimelineData = (analytics: EmailAnalytic[]): ChartData[] => {
  return analytics.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sent: item.sent_count,
    opened: item.open_count,
    clicked: item.click_count
  }));
};
