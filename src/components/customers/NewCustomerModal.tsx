
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface NewCustomerFormData {
  name: string;
  phone: string;
  email: string;
  vehicleInfo: string[];
}

interface NewCustomerModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddCustomer: (customer: NewCustomerFormData) => void;
}

const NewCustomerModal: React.FC<NewCustomerModalProps> = ({
  isOpen,
  onOpenChange,
  onAddCustomer
}) => {
  const [formData, setFormData] = useState<NewCustomerFormData>({
    name: "",
    phone: "",
    email: "",
    vehicleInfo: [""]
  });

  const handleVehicleChange = (index: number, value: string) => {
    const updatedVehicles = [...formData.vehicleInfo];
    updatedVehicles[index] = value;
    setFormData({...formData, vehicleInfo: updatedVehicles});
  };

  const addVehicleField = () => {
    setFormData({
      ...formData, 
      vehicleInfo: [...formData.vehicleInfo, ""]
    });
  };

  const removeVehicleField = (index: number) => {
    const updatedVehicles = [...formData.vehicleInfo];
    updatedVehicles.splice(index, 1);
    setFormData({...formData, vehicleInfo: updatedVehicles});
  };

  const handleSubmit = () => {
    onAddCustomer(formData);
    setFormData({
      name: "",
      phone: "",
      email: "",
      vehicleInfo: [""]
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customer-name" className="text-right">
              Name
            </Label>
            <Input
              id="customer-name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="col-span-3"
              placeholder="Full name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customer-phone" className="text-right">
              Phone
            </Label>
            <Input
              id="customer-phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="col-span-3"
              placeholder="Phone number"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customer-email" className="text-right">
              Email
            </Label>
            <Input
              id="customer-email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="col-span-3"
              placeholder="Email address (optional)"
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Vehicles
            </Label>
            <div className="col-span-3 space-y-2">
              {formData.vehicleInfo.map((vehicle, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={vehicle}
                    onChange={(e) => handleVehicleChange(index, e.target.value)}
                    placeholder={`Vehicle ${index + 1}`}
                  />
                  {formData.vehicleInfo.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      onClick={() => removeVehicleField(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={addVehicleField}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Vehicle
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add Customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewCustomerModal;
