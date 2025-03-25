
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VehicleSelectorProps {
  selectedVehicle: string;
  setSelectedVehicle: (vehicle: string) => void;
  customerVehicles: string[] | undefined;
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  selectedVehicle,
  setSelectedVehicle,
  customerVehicles,
}) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="vehicle-info" className="text-right">
        Vehicle
      </Label>
      {customerVehicles && customerVehicles.length > 0 ? (
        <Select 
          value={selectedVehicle} 
          onValueChange={setSelectedVehicle}
        >
          <SelectTrigger id="vehicle-info" className="col-span-3">
            <SelectValue placeholder="Select vehicle" />
          </SelectTrigger>
          <SelectContent>
            {customerVehicles.map((vehicle, index) => (
              <SelectItem key={index} value={vehicle}>
                {vehicle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id="vehicle-info"
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
          className="col-span-3"
          placeholder="Enter vehicle information"
        />
      )}
    </div>
  );
};

export default VehicleSelector;
