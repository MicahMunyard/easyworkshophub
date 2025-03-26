
import React from "react";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Mail, Phone, Car } from "lucide-react";
import { EmailType } from "@/types/email";

interface EmailMessageProps {
  email: EmailType;
  onCreateBooking: () => void;
  bookingCreated: boolean;
  isPotentialBooking: boolean;
}

const EmailMessage: React.FC<EmailMessageProps> = ({ 
  email, 
  onCreateBooking,
  bookingCreated,
  isPotentialBooking
}) => {
  // Extract potential booking details
  const extractedDetails = email.extracted_details || {
    name: null,
    phone: null,
    date: null,
    time: null,
    service: null,
    vehicle: null
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
          {bookingCreated && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Booking Created
            </Badge>
          )}
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
      </CardContent>
      
      <CardFooter className="border-t pt-3 flex justify-between">
        <div>
          {isPotentialBooking && !bookingCreated && (
            <Button 
              variant="default" 
              onClick={onCreateBooking}
              disabled={bookingCreated}
            >
              Create Booking from Email
            </Button>
          )}
        </div>
        <div>
          <Button variant="outline">
            Reply
          </Button>
        </div>
      </CardFooter>
    </>
  );
};

export default EmailMessage;
