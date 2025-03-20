
import React, { useState, useEffect } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, Calendar, Car, Clock } from "lucide-react";
import { CustomerDetailType } from "@/types/customer";
import CustomerNotes from "./CustomerNotes";
import CustomerTags from "./CustomerTags";
import CommunicationLog from "./CommunicationLog";
import ServiceReminders from "./ServiceReminders";

interface CustomerDetailsProps {
  customer: CustomerDetailType | null;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!customer) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Select a customer to view details</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-sidebar-accent text-sidebar-foreground">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="reminders">Service Reminders</TabsTrigger>
          <TabsTrigger value="history">Booking History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
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
        </TabsContent>
        
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Customer Notes</CardTitle>
              <CardDescription>Internal notes about this customer</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerNotes customerId={customer.id} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
              <CardDescription>Record of all communications with this customer</CardDescription>
            </CardHeader>
            <CardContent>
              <CommunicationLog customerId={customer.id} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reminders">
          <Card>
            <CardHeader>
              <CardTitle>Service Reminders</CardTitle>
              <CardDescription>Manage upcoming service reminders</CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceReminders customerId={customer.id} customerVehicles={customer.vehicleInfo} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
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
                            <span>Cost: ${booking.cost.toFixed(2)}</span>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetails;
