
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Car, Mail, RotateCw, Loader2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface CustomerInfoFieldsProps {
  customer: string;
  phone: string;
  email: string;
  car: string;
  vehicleDetails?: {
    make?: string;
    model?: string;
    year?: string;
    vin?: string;
    color?: string;
    bodyType?: string;
    plateNumber?: string;
    state?: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isReturningCustomer?: boolean;
  isCheckingCustomer?: boolean;
}

const CustomerInfoFields: React.FC<CustomerInfoFieldsProps> = ({
  customer,
  phone,
  email,
  car,
  vehicleDetails,
  handleChange,
  isReturningCustomer = false,
  isCheckingCustomer = false,
}) => {
  const [isVehicleDetailsOpen, setIsVehicleDetailsOpen] = React.useState(false);

  const hasVehicleDetails = vehicleDetails && (
    vehicleDetails.make || 
    vehicleDetails.model || 
    vehicleDetails.vin || 
    vehicleDetails.color || 
    vehicleDetails.bodyType
  );

  return (
    <>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="customer" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Customer Name
          </Label>
          {isCheckingCustomer && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {isReturningCustomer && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <RotateCw className="h-3 w-3" /> Returning Customer
            </Badge>
          )}
        </div>
        <Input
          id="customer"
          name="customer"
          value={customer}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="phone" className="flex items-center gap-2">
          <Phone className="h-4 w-4" /> Phone Number
        </Label>
        <Input
          id="phone"
          name="phone"
          value={phone}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" /> Email Address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email || ""}
          onChange={handleChange}
          placeholder="customer@example.com"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="car" className="flex items-center gap-2">
          <Car className="h-4 w-4" /> Vehicle
        </Label>
        <Input
          id="car"
          name="car"
          value={car}
          onChange={handleChange}
          required
        />
        
        {hasVehicleDetails && (
          <Collapsible 
            open={isVehicleDetailsOpen}
            onOpenChange={setIsVehicleDetailsOpen}
            className="mt-2"
          >
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2 w-full justify-start">
                <Info className="h-4 w-4" />
                {isVehicleDetailsOpen ? "Hide Vehicle Details" : "Show Vehicle Details"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2 border rounded-md p-3">
              <div className="grid grid-cols-2 gap-2">
                {vehicleDetails?.make && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Make</Label>
                    <p className="text-sm">{vehicleDetails.make}</p>
                  </div>
                )}
                {vehicleDetails?.model && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Model</Label>
                    <p className="text-sm">{vehicleDetails.model}</p>
                  </div>
                )}
                {vehicleDetails?.year && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Year</Label>
                    <p className="text-sm">{vehicleDetails.year}</p>
                  </div>
                )}
                {vehicleDetails?.color && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Color</Label>
                    <p className="text-sm">{vehicleDetails.color}</p>
                  </div>
                )}
                {vehicleDetails?.bodyType && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Body Type</Label>
                    <p className="text-sm">{vehicleDetails.bodyType}</p>
                  </div>
                )}
                {vehicleDetails?.vin && (
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">VIN</Label>
                    <p className="text-sm font-mono">{vehicleDetails.vin}</p>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </>
  );
};

export default CustomerInfoFields;
