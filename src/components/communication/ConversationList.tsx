
import React from "react";
import { Conversation } from "@/types/communication";
import ConversationItem from "./ConversationItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelect: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  onSelect
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  
  const filteredConversations = conversations.filter(conversation => 
    conversation.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.contact_handle?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="relative">
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {filteredConversations.map(conversation => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversation?.id === conversation.id}
              onClick={() => onSelect(conversation)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationList;
