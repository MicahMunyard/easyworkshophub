
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CustomerDetailType } from "@/types/customer";

interface CustomerOverviewTabProps {
  customer: CustomerDetailType;
}

const CustomerOverviewTab: React.FC<CustomerOverviewTabProps> = ({ customer }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Overview</CardTitle>
        <CardDescription>Summary of customer information and activity</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h3 className="font-medium">Recent Bookings</h3>
            {customer.bookingHistory && customer.bookingHistory.length > 0 ? (
              <div className="space-y-2">
                {customer.bookingHistory.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="text-sm border-l-2 border-primary pl-2">
                    <div className="font-medium">{booking.service}</div>
                    <div className="text-xs text-muted-foreground">{booking.date}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent bookings</p>
            )}
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h3 className="font-medium">Recent Communications</h3>
            <div id="recent-communications-placeholder">
              <p className="text-sm text-muted-foreground">Loading communication history...</p>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h3 className="font-medium">Upcoming Reminders</h3>
            <div id="upcoming-reminders-placeholder">
              <p className="text-sm text-muted-foreground">Loading service reminders...</p>
            </div>
          </div>
        </div>
        
        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
          <h3 className="font-medium">Latest Notes</h3>
          <div id="latest-notes-placeholder">
            <p className="text-sm text-muted-foreground">Loading customer notes...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerOverviewTab;
