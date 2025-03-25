
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Common service types that are frequently used
const commonServiceTypes = [
  "Oil Change",
  "Tire Rotation",
  "Brake Inspection",
  "Annual Service",
  "MOT",
  "Air Filter Replacement",
  "Spark Plug Replacement"
];

interface ServiceTypeSelectorProps {
  serviceType: string;
  setServiceType: (type: string) => void;
}

const ServiceTypeSelector: React.FC<ServiceTypeSelectorProps> = ({
  serviceType,
  setServiceType
}) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="service-type" className="text-right">
        Service
      </Label>
      <div className="col-span-3">
        <Select 
          value={serviceType} 
          onValueChange={setServiceType}
        >
          <SelectTrigger id="service-type">
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            {commonServiceTypes.map((type, index) => (
              <SelectItem key={index} value={type}>
                {type}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom Service</SelectItem>
          </SelectContent>
        </Select>
        
        {serviceType === 'custom' && (
          <Input
            className="mt-2"
            value={serviceType === 'custom' ? '' : serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            placeholder="Enter custom service type"
          />
        )}
      </div>
    </div>
  );
};

export default ServiceTypeSelector;
