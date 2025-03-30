
import React from "react";
import { Card } from "@/components/ui/card";
import ConversationList from "./ConversationList";
import MessageThread from "./MessageThread";
import ContactPanel from "./ContactPanel";
import { Conversation } from "@/types/communication";
import EmptyInbox from "./EmptyInbox";

interface CommunicationInboxProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  setSelectedConversation: (conversation: Conversation | null) => void;
  messages: any[];
  isLoading: boolean;
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  isSendingMessage: boolean;
  showContactDrawer: boolean;
  setShowContactDrawer: (show: boolean) => void;
  addContactToCustomers: (conversation: Conversation) => void;
}

const CommunicationInbox: React.FC<CommunicationInboxProps> = ({
  conversations,
  selectedConversation,
  setSelectedConversation,
  messages,
  isLoading,
  newMessage,
  setNewMessage,
  sendMessage,
  isSendingMessage,
  showContactDrawer,
  setShowContactDrawer,
  addContactToCustomers
}) => {
  if (isLoading) {
    return <div className="flex justify-center p-10">Loading conversations...</div>;
  }

  if (conversations.length === 0) {
    return <EmptyInbox />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-250px)]">
      {/* Conversations List (3/12 width on desktop) */}
      <Card className="lg:col-span-3 overflow-hidden">
        <ConversationList 
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelect={setSelectedConversation}
        />
      </Card>
      
      {/* Message Thread (6/12 width on desktop) */}
      <Card className="lg:col-span-6 flex flex-col overflow-hidden">
        {selectedConversation ? (
          <MessageThread 
            conversation={selectedConversation}
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sendMessage={sendMessage}
            isSendingMessage={isSendingMessage}
            onContactInfoClick={() => setShowContactDrawer(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <p className="text-muted-foreground">Select a conversation to view messages</p>
          </div>
        )}
      </Card>
      
      {/* Contact Panel (3/12 width on desktop) */}
      <div className="lg:col-span-3">
        <ContactPanel 
          conversation={selectedConversation}
          addToCustomers={() => {
            if (selectedConversation) {
              addContactToCustomers(selectedConversation);
            }
          }}
        />
      </div>
    </div>
  );
};

export default CommunicationInbox;
