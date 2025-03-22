
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench } from "lucide-react";

interface ServiceOption {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface ServiceSelectorProps {
  selectedServiceId: string | null;
  services: ServiceOption[];
  onServiceChange: (value: string) => void;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  selectedServiceId,
  services,
  onServiceChange,
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="serviceId" className="flex items-center gap-2">
        <Wrench className="h-4 w-4" /> Service
      </Label>
      <Select 
        value={selectedServiceId || ""} 
        onValueChange={onServiceChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select service" />
        </SelectTrigger>
        <SelectContent>
          {services.map((service) => (
            <SelectItem key={service.id} value={service.id}>
              {service.name} - ${service.price.toFixed(2)} - {service.duration} min
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ServiceSelector;
