
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle } from "lucide-react";

const JobMessagesTab: React.FC = () => {
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    // Note: This would be implemented with real functionality
    console.log("Sending message:", message);
    setMessage("");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Customer Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-6">
          No messages for this job yet
        </p>
        
        <div className="mt-4">
          <Label htmlFor="message">Send Message to Customer</Label>
          <Textarea 
            id="message" 
            placeholder="Type your message here..." 
            className="mt-1"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button className="mt-2 gap-1" onClick={handleSendMessage}>
            <MessageCircle className="h-4 w-4" />
            Send Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobMessagesTab;
