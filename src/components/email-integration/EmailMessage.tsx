
import React, { useState } from "react";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, Car, CheckCircle, Loader2, Mail, Phone, User } from "lucide-react";
import { EmailType } from "@/types/email";
import EmailReplyForm from "./EmailReplyForm";

interface EmailMessageProps {
  email: EmailType;
  onCreateBooking: () => Promise<boolean>;
  onReply: (content: string) => Promise<boolean>;
  bookingCreated: boolean;
  isPotentialBooking: boolean;
  isProcessing: boolean;
}

const EmailMessage: React.FC<EmailMessageProps> = ({ 
  email, 
  onCreateBooking,
  onReply,
  bookingCreated,
  isPotentialBooking,
  isProcessing
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  // Extract potential booking details
  const extractedDetails = email.extracted_details || {
    name: null,
    phone: null,
    date: null,
    time: null,
    service: null,
    vehicle: null
  };

  // Get status badge
  const getStatusBadge = () => {
    if (bookingCreated) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Booking Created
        </Badge>
      );
    }
    
    if (isProcessing) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" /> Processing
        </Badge>
      );
    }
    
    if (email.processing_status === 'failed') {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Failed
        </Badge>
      );
    }
    
    if (isPotentialBooking) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Potential Booking
        </Badge>
      );
    }
    
    return null;
  };
  
  return (
    <>
      <CardHeader className="border-b pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1">{email.subject}</CardTitle>
            <div className="text-sm text-muted-foreground mb-1">
              From: <span className="font-medium">{email.from}</span> ({email.sender_email})
            </div>
            <div className="text-sm text-muted-foreground">
              Date: {new Date(email.date).toLocaleDateString()} at {new Date(email.date).toLocaleTimeString()}
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div 
          className="prose prose-sm max-w-none" 
          dangerouslySetInnerHTML={{ __html: email.content }}
        />
        
        {isPotentialBooking && !bookingCreated && (
          <div className="mt-6 border rounded-md p-4 bg-blue-50/50">
            <h3 className="text-base font-semibold mb-3">Detected Booking Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Customer Name</div>
                  <div className="font-medium">{extractedDetails.name || "Not detected"}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Phone Number</div>
                  <div className="font-medium">{extractedDetails.phone || "Not detected"}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Date & Time</div>
                  <div className="font-medium">
                    {extractedDetails.date ? `${extractedDetails.date} at ${extractedDetails.time || "TBD"}` : "Not detected"}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Vehicle</div>
                  <div className="font-medium">{extractedDetails.vehicle || "Not detected"}</div>
                </div>
              </div>
              
              <div className="col-span-2">
                <div className="text-sm text-muted-foreground mb-1">Service Requested</div>
                <div className="font-medium">{extractedDetails.service || "Not detected"}</div>
              </div>
            </div>
          </div>
        )}
        
        {showReplyForm && (
          <EmailReplyForm 
            email={email} 
            onSendReply={onReply}
            onCancel={() => setShowReplyForm(false)}
          />
        )}
      </CardContent>
      
      {!showReplyForm && (
        <CardFooter className="border-t pt-3 flex justify-between">
          <div>
            {isPotentialBooking && !bookingCreated && (
              <Button 
                variant="default" 
                onClick={onCreateBooking}
                disabled={bookingCreated || isProcessing}
                className="gap-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  "Create Booking from Email"
                )}
              </Button>
            )}
          </div>
          <div>
            <Button 
              variant="outline"
              className="gap-1"
              onClick={() => setShowReplyForm(true)}
            >
              <Mail className="h-4 w-4" /> Reply
            </Button>
          </div>
        </CardFooter>
      )}
    </>
  );
};

export default EmailMessage;
