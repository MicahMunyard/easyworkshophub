
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Clock, FileText, DollarSign } from "lucide-react";
import { CustomerDetailType } from "@/types/customer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
          <Accordion type="single" collapsible className="w-full">
            {customer.bookingHistory.map((booking) => (
              <AccordionItem key={booking.id} value={`booking-${booking.id}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <Car className="h-5 w-5 text-muted-foreground" />
                      <div className="text-left">
                        <div className="font-medium">{booking.service}</div>
                        <div className="text-sm text-muted-foreground">{booking.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        ${typeof booking.cost === 'number' ? booking.cost.toFixed(2) : '0.00'}
                      </span>
                      <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4 space-y-4 border-t">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Vehicle:</span>
                          <span className="font-medium">{booking.vehicle}</span>
                        </div>
                        {booking.mechanic && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Technician:</span>
                            <span className="font-medium">{booking.mechanic}</span>
                          </div>
                        )}
                        {booking.duration && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-medium">{booking.duration} minutes</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <div className="text-muted-foreground mb-2">Cost Breakdown:</div>
                            {booking.invoiceItems && booking.invoiceItems.length > 0 ? (
                              <div className="space-y-1">
                                {booking.invoiceItems.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-xs">
                                    <span>{item.description} (×{item.quantity})</span>
                                    <span className="font-medium">${item.total.toFixed(2)}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                                  <span>Total:</span>
                                  <span>${booking.cost.toFixed(2)}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm">
                                {booking.cost > 0 ? (
                                  <span className="font-medium">${booking.cost.toFixed(2)}</span>
                                ) : (
                                  <span className="text-muted-foreground italic">Cost not recorded</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {booking.notes && (
                      <div className="pt-3 border-t">
                        <div className="text-sm text-muted-foreground mb-1">Notes:</div>
                        <div className="text-sm">{booking.notes}</div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
