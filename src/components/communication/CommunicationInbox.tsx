
import React from "react";
import { Card } from "@/components/ui/card";
import ConversationList from "./ConversationList";
import MessageThread from "./MessageThread";
import ContactPanel from "./ContactPanel";
import { Conversation, Message } from "@/types/communication";
import EmptyInbox from "./EmptyInbox";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface CommunicationInboxProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  setSelectedConversation: (conversation: Conversation | null) => void;
  messages: Message[];
  isLoading: boolean;
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  isSendingMessage: boolean;
  showContactDrawer: boolean;
  setShowContactDrawer: (show: boolean) => void;
  addContactToCustomers: (conversation: Conversation) => void;
  addMessage: (message: Message) => void;
  hasFacebookConnection?: boolean;
  fetchConversations?: () => void;
  onSwitchToConnections?: () => void;
}

const CommunicationInbox: React.FC<CommunicationInboxProps> = ({
  conversations,
  selectedConversation,
  setSelectedConversation,
  isLoading,
  newMessage,
  setNewMessage,
  sendMessage,
  isSendingMessage,
  showContactDrawer,
  setShowContactDrawer,
  addContactToCustomers,
  addMessage,
  hasFacebookConnection,
  fetchConversations,
  onSwitchToConnections
}) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return <div className="flex justify-center p-10">Loading conversations...</div>;
  }

  if (conversations.length === 0) {
    return (
      <EmptyInbox 
        hasFacebookConnection={hasFacebookConnection} 
        onRefresh={fetchConversations}
        onSwitchToConnections={onSwitchToConnections}
      />
    );
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="flex flex-col gap-4">
        {/* Show conversation list when no conversation is selected */}
        {!selectedConversation ? (
          <Card className="overflow-hidden">
            <ConversationList 
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelect={setSelectedConversation}
            />
          </Card>
        ) : (
          // Show message thread when conversation is selected
          <div className="flex flex-col gap-4">
            <Card className="flex flex-col overflow-hidden">
              <MessageThread 
                conversation={selectedConversation}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                sendMessage={sendMessage}
                isSendingMessage={isSendingMessage}
                onContactInfoClick={() => setShowContactDrawer(true)}
                onBackClick={() => setSelectedConversation(null)}
                isMobile={true}
                addMessage={addMessage}
              />
            </Card>
            
            {/* Contact drawer for mobile */}
            <Sheet open={showContactDrawer} onOpenChange={setShowContactDrawer}>
              <SheetContent side="right" className="w-full max-w-md sm:max-w-lg">
                <ContactPanel 
                  conversation={selectedConversation}
                  addToCustomers={() => {
                    if (selectedConversation) {
                      addContactToCustomers(selectedConversation);
                    }
                  }}
                />
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    );
  }

  // Desktop layout
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
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sendMessage={sendMessage}
            isSendingMessage={isSendingMessage}
            onContactInfoClick={() => setShowContactDrawer(true)}
            isMobile={false}
            addMessage={addMessage}
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
