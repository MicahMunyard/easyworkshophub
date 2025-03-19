
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Car, 
  Wrench, 
  DollarSign, 
  Clock,
  UserCheck 
} from "lucide-react";
import { CustomerDetailType } from "@/types/customer";

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerDetailType | null;
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  customer 
}) => {
  if (!customer) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "confirmed": return "bg-blue-500";
      case "completed": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            Complete history and information for this customer
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Customer Info Section */}
          <div className="grid gap-4 p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold">Customer Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Name:</span> 
                <span>{customer.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Phone:</span> 
                <span>{customer.phone}</span>
              </div>
              
              {customer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span> 
                  <span>{customer.email}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Status:</span> 
                <Badge variant={customer.status === "active" ? "default" : "outline"}>
                  {customer.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Last Visit:</span> 
                <span>{customer.lastVisit || "N/A"}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Total Bookings:</span> 
                <span>{customer.totalBookings}</span>
              </div>
            </div>
            
            {customer.vehicleInfo && customer.vehicleInfo.length > 0 && (
              <div className="mt-2">
                <h4 className="text-sm font-medium mb-2">Vehicles:</h4>
                <ul className="space-y-1">
                  {customer.vehicleInfo.map((vehicle, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span>{vehicle}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Booking History Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Booking History</h3>
            
            <Table>
              <TableCaption>Complete booking history</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mechanic</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.bookingHistory.length > 0 ? (
                  customer.bookingHistory.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-muted-foreground" />
                          {booking.service}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          {booking.vehicle}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          {booking.cost.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{booking.mechanic || "Unassigned"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No booking history found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsModal;
