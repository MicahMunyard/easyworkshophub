
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

interface EmailStatusBadgeProps {
  bookingCreated: boolean;
  isProcessing: boolean;
  processingStatus?: 'failed' | 'pending' | 'processing' | 'completed';
  isPotentialBooking: boolean;
}

const EmailStatusBadge: React.FC<EmailStatusBadgeProps> = ({
  bookingCreated,
  isProcessing,
  processingStatus,
  isPotentialBooking,
}) => {
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
  
  if (processingStatus === 'failed') {
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

export default EmailStatusBadge;
