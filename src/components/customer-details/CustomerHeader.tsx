
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Calendar, Car, Clock } from "lucide-react";
import { CustomerDetailType } from "@/types/customer";
import CustomerTags from "@/components/CustomerTags";

interface CustomerHeaderProps {
  customer: CustomerDetailType;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ customer }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{customer.name}</CardTitle>
            <CardDescription>
              Customer since {customer.lastVisit ? new Date(customer.lastVisit).getFullYear() : 'N/A'}
            </CardDescription>
          </div>
          <Badge variant={customer.status === "active" ? "default" : "outline"}>
            {customer.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
            
            {customer.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
            )}
            
            {customer.lastVisit && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Last visit: {customer.lastVisit}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{customer.totalBookings} {customer.totalBookings === 1 ? 'booking' : 'bookings'}</span>
            </div>
            
            {customer.vehicleInfo && customer.vehicleInfo.length > 0 && (
              <div className="space-y-1">
                <div className="text-sm font-medium">Vehicles:</div>
                {customer.vehicleInfo.map((vehicle, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm pl-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span>{vehicle}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <CustomerTags customerId={customer.id} />
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerHeader;
