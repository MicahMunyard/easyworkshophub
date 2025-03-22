
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Warehouse } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface BayOption {
  id: string;
  name: string;
}

interface ServiceBaySelectorProps {
  selectedBayId: string | null;
  bays: BayOption[];
  onBayChange: (value: string) => void;
}

const ServiceBaySelector: React.FC<ServiceBaySelectorProps> = ({
  selectedBayId,
  bays,
  onBayChange,
}) => {
  const { user } = useAuth();

  return (
    <div className="grid gap-2">
      <Label htmlFor="bayId" className="flex items-center gap-2">
        <Warehouse className="h-4 w-4" /> Service Bay
      </Label>
      <Select 
        value={selectedBayId || ""} 
        onValueChange={onBayChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select service bay" />
        </SelectTrigger>
        <SelectContent>
          {bays.map((bay) => (
            <SelectItem key={bay.id} value={bay.id}>
              {bay.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ServiceBaySelector;
