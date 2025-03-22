
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface TechnicianOption {
  id: string;
  name: string;
}

interface TechnicianSelectorProps {
  selectedTechnicianId: string | null;
  technicians: TechnicianOption[];
  onTechnicianChange: (value: string) => void;
}

const TechnicianSelector: React.FC<TechnicianSelectorProps> = ({
  selectedTechnicianId,
  technicians,
  onTechnicianChange,
}) => {
  const { user } = useAuth();

  return (
    <div className="grid gap-2">
      <Label htmlFor="technicianId" className="flex items-center gap-2">
        <User className="h-4 w-4" /> Technician
      </Label>
      <Select 
        value={selectedTechnicianId || ""} 
        onValueChange={onTechnicianChange}
        disabled={!user}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select technician" />
        </SelectTrigger>
        <SelectContent>
          {technicians.map((tech) => (
            <SelectItem key={tech.id} value={tech.id}>
              {tech.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!user && (
        <p className="text-xs text-muted-foreground mt-1">
          Please sign in to select a technician
        </p>
      )}
    </div>
  );
};

export default TechnicianSelector;
