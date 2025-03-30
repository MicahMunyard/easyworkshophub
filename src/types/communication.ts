
export interface Conversation {
  id: string;
  user_id: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'other';
  external_id?: string;
  contact_name: string;
  contact_handle?: string;
  profile_picture_url?: string;
  last_message_at: string;
  unread: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'contact';
  content: string;
  attachment_url?: string;
  sent_at: string;
  read_at?: string;
  created_at: string;
}

export interface SocialConnection {
  id: string;
  platform: 'facebook' | 'instagram' | 'tiktok';
  page_id?: string;
  page_name?: string;
  connected_at: string;
  status: 'active' | 'disconnected';
}
