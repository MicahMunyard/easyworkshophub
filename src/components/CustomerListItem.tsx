
import React from "react";
import { CustomerType } from "@/types/customer";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, Calendar, Phone, MoreHorizontal } from "lucide-react";

interface CustomerListItemProps {
  customer: CustomerType;
  onClick: (id: string) => void;
}

const CustomerListItem: React.FC<CustomerListItemProps> = ({ customer, onClick }) => {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onClick(customer.id)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{customer.name}</h3>
            
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Phone className="h-3.5 w-3.5 mr-1" />
              {customer.phone}
            </div>
            
            {customer.vehicleInfo && customer.vehicleInfo.length > 0 && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Car className="h-3.5 w-3.5 mr-1" />
                {customer.vehicleInfo[0]} 
                {customer.vehicleInfo.length > 1 && ` + ${customer.vehicleInfo.length - 1} more`}
              </div>
            )}
            
            {customer.lastVisit && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                Last visit: {customer.lastVisit}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge variant={customer.status === "active" ? "default" : "outline"}>
              {customer.status}
            </Badge>
            
            <div className="text-sm">
              {customer.totalBookings} {customer.totalBookings === 1 ? 'booking' : 'bookings'}
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={(e) => {
                e.stopPropagation();
                onClick(customer.id);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerListItem;
