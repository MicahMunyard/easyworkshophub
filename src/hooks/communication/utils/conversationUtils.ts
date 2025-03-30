
import { Conversation } from "@/types/communication";

export const getPlatformIcon = (platform: 'facebook' | 'instagram' | 'tiktok' | 'other') => {
  switch (platform) {
    case 'facebook':
      return 'facebook';
    case 'instagram':
      return 'instagram';
    case 'tiktok':
      return 'tiktok';
    default:
      return 'message-circle';
  }
};

export const getPlatformName = (platform: 'facebook' | 'instagram' | 'tiktok' | 'other'): string => {
  switch (platform) {
    case 'facebook':
      return 'Facebook';
    case 'instagram':
      return 'Instagram';
    case 'tiktok':
      return 'TikTok';
    default:
      return 'Other';
  }
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
