
import { EmailAnalytic } from "../types";

// Calculate open rate as a percentage
export const calculateOpenRate = (analytics: EmailAnalytic[]): string => {
  const totalSent = analytics.reduce((sum, item) => sum + item.sent_count, 0);
  const totalOpens = analytics.reduce((sum, item) => sum + item.open_count, 0);
  
  return totalSent ? (totalOpens / totalSent * 100).toFixed(1) : "0.0";
};

// Calculate click rate as a percentage
export const calculateClickRate = (analytics: EmailAnalytic[]): string => {
  const totalOpens = analytics.reduce((sum, item) => sum + item.open_count, 0);
  const totalClicks = analytics.reduce((sum, item) => sum + item.click_count, 0);
  
  return totalOpens ? (totalClicks / totalOpens * 100).toFixed(1) : "0.0";
};

// Calculate total sent emails
export const calculateTotalSent = (analytics: EmailAnalytic[]): number => {
  return analytics.reduce((sum, item) => sum + item.sent_count, 0);
};

// Calculate total opened emails
export const calculateTotalOpens = (analytics: EmailAnalytic[]): number => {
  return analytics.reduce((sum, item) => sum + item.open_count, 0);
};

// Calculate total clicked emails
export const calculateTotalClicks = (analytics: EmailAnalytic[]): number => {
  return analytics.reduce((sum, item) => sum + item.click_count, 0);
};

// Prepare data for engagement funnel
export const prepareEngagementData = (analytics: EmailAnalytic[]) => {
  const totalSent = calculateTotalSent(analytics);
  const totalOpens = calculateTotalOpens(analytics);
  const totalClicks = calculateTotalClicks(analytics);
  
  return [
    { name: "Sent", value: totalSent },
    { name: "Opened", value: totalOpens },
    { name: "Clicked", value: totalClicks }
  ];
};

// Prepare data for campaign performance
export const prepareCampaignPerformanceData = (analytics: EmailAnalytic[]) => {
  return analytics.map(item => ({
    name: item.campaign_name,
    openRate: (item.open_count / item.sent_count * 100).toFixed(1),
    clickRate: (item.click_count / item.open_count * 100).toFixed(1)
  }));
};

// Prepare data for campaign timeline
export const prepareCampaignTimelineData = (analytics: EmailAnalytic[]) => {
  return analytics.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sent: item.sent_count,
    opened: item.open_count,
    clicked: item.click_count
  }));
};
