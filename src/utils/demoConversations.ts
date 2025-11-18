import { Conversation, Message } from "@/types/communication";

export const generateDemoConversations = (userId: string): Conversation[] => {
  const now = new Date();
  
  return [
    {
      id: "demo-conv-1",
      user_id: userId,
      platform: 'facebook' as const,
      external_id: "demo-fb-1",
      contact_name: "Sarah Johnson",
      contact_handle: "@sarahjohnson",
      profile_picture_url: undefined,
      last_message_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      unread: true,
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "demo-conv-2",
      user_id: userId,
      platform: 'facebook' as const,
      external_id: "demo-fb-2",
      contact_name: "Mike Peterson",
      contact_handle: "@mikepeterson",
      profile_picture_url: undefined,
      last_message_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      unread: false,
      created_at: new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "demo-conv-3",
      user_id: userId,
      platform: 'facebook' as const,
      external_id: "demo-fb-3",
      contact_name: "Emma Wilson",
      contact_handle: "@emmawilson",
      profile_picture_url: undefined,
      last_message_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      unread: true,
      created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

export const generateDemoMessages = (conversationId: string): Message[] => {
  const now = new Date();
  
  const messagesByConversation: Record<string, Message[]> = {
    "demo-conv-1": [
      {
        id: "demo-msg-1-1",
        conversation_id: conversationId,
        sender_type: "contact",
        content: "Hi there! I need to schedule a service for my 2019 Honda Civic.",
        sent_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        isOutgoing: false,
      },
      {
        id: "demo-msg-1-2",
        conversation_id: conversationId,
        sender_type: "user",
        content: "Hello Sarah! We'd be happy to help. What type of service do you need?",
        sent_at: new Date(now.getTime() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
        created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
        isOutgoing: true,
      },
      {
        id: "demo-msg-1-3",
        conversation_id: conversationId,
        sender_type: "contact",
        content: "Just a regular oil change and tire rotation. When's your next available appointment?",
        sent_at: new Date(now.getTime() - 2 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
        created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
        isOutgoing: false,
      },
    ],
    "demo-conv-2": [
      {
        id: "demo-msg-2-1",
        conversation_id: conversationId,
        sender_type: "contact",
        content: "Do you have availability for a brake inspection tomorrow?",
        sent_at: new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString(),
        isOutgoing: false,
      },
      {
        id: "demo-msg-2-2",
        conversation_id: conversationId,
        sender_type: "user",
        content: "Yes! We have slots at 9 AM, 11 AM, and 2 PM tomorrow.",
        sent_at: new Date(now.getTime() - 25 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
        created_at: new Date(now.getTime() - 25 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
        isOutgoing: true,
      },
      {
        id: "demo-msg-2-3",
        conversation_id: conversationId,
        sender_type: "contact",
        content: "Perfect! I'll take the 9 AM slot.",
        sent_at: new Date(now.getTime() - 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
        created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
        isOutgoing: false,
      },
      {
        id: "demo-msg-2-4",
        conversation_id: conversationId,
        sender_type: "user",
        content: "Great! You're all set for 9 AM tomorrow. See you then!",
        sent_at: new Date(now.getTime() - 24 * 60 * 60 * 1000 - 20 * 60 * 1000).toISOString(),
        created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000 - 20 * 60 * 1000).toISOString(),
        isOutgoing: true,
      },
      {
        id: "demo-msg-2-5",
        conversation_id: conversationId,
        sender_type: "contact",
        content: "Thanks! See you tomorrow at 9 AM.",
        sent_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        isOutgoing: false,
      },
    ],
    "demo-conv-3": [
      {
        id: "demo-msg-3-1",
        conversation_id: conversationId,
        sender_type: "contact",
        content: "Hi! Do you have brake pads in stock for a 2020 Toyota RAV4?",
        sent_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        isOutgoing: false,
      },
      {
        id: "demo-msg-3-2",
        conversation_id: conversationId,
        sender_type: "user",
        content: "Let me check our inventory for you. One moment please.",
        sent_at: new Date(now.getTime() - 3 * 60 * 60 * 1000 - 45 * 60 * 1000).toISOString(),
        created_at: new Date(now.getTime() - 3 * 60 * 60 * 1000 - 45 * 60 * 1000).toISOString(),
        isOutgoing: true,
      },
    ],
  };
  
  return messagesByConversation[conversationId] || [];
};

export const isDemoConversation = (conversationId: string): boolean => {
  return conversationId.startsWith("demo-");
};

export const generateDemoNotifications = () => {
  const now = new Date();
  
  return [
    {
      title: "New message from Sarah Johnson",
      message: "Hi there! I need to schedule a service for my 2019 Honda Civic.",
      type: "message_received" as const,
      priority: "medium" as const,
      actionData: {
        conversationId: "demo-conv-1",
        contactName: "Sarah Johnson",
        platform: "facebook",
        messagePreview: "Hi there! I need to schedule a service for my 2019 Honda Civic."
      }
    },
    {
      title: "New message from Emma Wilson",
      message: "Hi! Can you check if my car is ready for pickup?",
      type: "message_received" as const,
      priority: "medium" as const,
      actionData: {
        conversationId: "demo-conv-3",
        contactName: "Emma Wilson",
        platform: "facebook",
        messagePreview: "Hi! Can you check if my car is ready for pickup?"
      }
    }
  ];
};
