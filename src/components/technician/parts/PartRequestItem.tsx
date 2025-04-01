
import React from "react";
import { Check, Clock, X, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PartRequest } from "@/types/technician";

interface PartRequestItemProps {
  part: PartRequest;
}

const PartRequestItem: React.FC<PartRequestItemProps> = ({ part }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 flex items-center gap-1">
            <X className="h-3 w-3" />
            Denied
          </Badge>
        );
      case 'delivered':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Truck className="h-3 w-3" />
            Delivered
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-md p-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{part.name}</p>
          <p className="text-sm text-muted-foreground">
            Quantity: {part.quantity}
          </p>
        </div>
        {getStatusBadge(part.status)}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Requested {new Date(part.requested_at).toLocaleString()}
      </div>
    </div>
  );
};

export default PartRequestItem;
