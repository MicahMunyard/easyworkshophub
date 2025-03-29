
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Car, RotateCw, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CustomerInfoFieldsProps {
  customer: string;
  phone: string;
  car: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isReturningCustomer?: boolean;
  isCheckingCustomer?: boolean;
}

const CustomerInfoFields: React.FC<CustomerInfoFieldsProps> = ({
  customer,
  phone,
  car,
  handleChange,
  isReturningCustomer = false,
  isCheckingCustomer = false,
}) => {
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
      </div>
    </>
  );
};

export default CustomerInfoFields;
