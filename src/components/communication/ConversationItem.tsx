
import React from "react";
import { Conversation } from "@/types/communication";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Facebook, Instagram, MessageCircle } from "lucide-react";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-4 w-4 text-blue-600" />;
      case 'instagram':
        return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'tiktok':
        return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.97 2.29a4.5 4.5 0 0 1-.88 1.74c-.14.2-.5.3-.5.3v1.73c.26 0 .94-.39.94-.39v4.33a3.5 3.5 0 0 1-6.07 2.4 3.5 3.5 0 0 1 5.1-4.78V4.96A6.04 6.04 0 0 0 12 6.45V3.62c-.22-.14-.7-.5-.7-.5a3.45 3.45 0 0 0 1.36-2.15h-2.26a11.72 11.72 0 0 1 .57 1.32Z" fill="#FF004F"/>
        </svg>;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };
  
  const timeAgo = formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true });
  
  return (
    <div 
      className={`flex items-start p-3 gap-3 cursor-pointer hover:bg-accent/50 transition-colors ${
        isSelected ? 'bg-accent' : ''
      }`}
      onClick={onClick}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={conversation.profile_picture_url} alt={conversation.contact_name} />
        <AvatarFallback>{getInitials(conversation.contact_name)}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${conversation.unread ? 'font-semibold' : ''}`}>
              {conversation.contact_name}
            </span>
            {getPlatformIcon(conversation.platform)}
          </div>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-muted-foreground truncate">
            {conversation.contact_handle}
          </p>
          {conversation.unread && (
            <Badge variant="default" className="rounded-full h-2 w-2 p-0" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
