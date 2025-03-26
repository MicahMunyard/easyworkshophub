
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import { CustomerDetailType } from "@/types/customer";

interface CustomerHistoryTabProps {
  customer: CustomerDetailType;
}

const CustomerHistoryTab: React.FC<CustomerHistoryTabProps> = ({ customer }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking History</CardTitle>
        <CardDescription>Complete service history for this customer</CardDescription>
      </CardHeader>
      <CardContent>
        {customer.bookingHistory && customer.bookingHistory.length > 0 ? (
          <div className="space-y-4">
            {customer.bookingHistory.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">{booking.service}</h3>
                    <div className="text-sm text-muted-foreground">{booking.date}</div>
                  </div>
                  <div className="text-sm grid gap-1">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.vehicle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost: ${typeof booking.cost === 'number' ? booking.cost.toFixed(2) : '0.00'}</span>
                      <Badge>{booking.status}</Badge>
                    </div>
                    {booking.mechanic && (
                      <div className="text-muted-foreground">
                        Technician: {booking.mechanic}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No booking history found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerHistoryTab;
