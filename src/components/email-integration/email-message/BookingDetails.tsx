import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Phone, Calendar, Car } from "lucide-react";
import { ExtractedDetails } from "@/types/email";

interface BookingDetailsProps {
  extractedDetails: ExtractedDetails;
  onCreateBooking: (details: ExtractedDetails) => Promise<void>;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ extractedDetails, onCreateBooking }) => {
  const handleCreateBooking = async () => {
    await onCreateBooking(extractedDetails);
  };

  return (
    <div className="mt-6 border rounded-md p-4 bg-blue-50/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">Detected Booking Information</h3>
        <Button onClick={handleCreateBooking} variant="default">
          Create Booking
        </Button>
      </div>
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
  );
};

export default BookingDetails;
