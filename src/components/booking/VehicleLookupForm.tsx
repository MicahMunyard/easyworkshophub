
import React, { useState } from "react";
import { useVehicleSearch } from "@/hooks/vehicles/useVehicleSearch";
import { AustralianState, Vehicle } from "@/types/nevdis";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface VehicleLookupFormProps {
  onVehicleFound: (vehicle: Vehicle) => void;
  onManualEntry?: () => void;
}

const VehicleLookupForm: React.FC<VehicleLookupFormProps> = ({ onVehicleFound, onManualEntry }) => {
  const [plateNumber, setPlateNumber] = useState<string>("");
  const [state, setState] = useState<AustralianState>("NSW");
  const { searchVehicleByPlate, isLoading, error } = useVehicleSearch();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plateNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a plate number",
        variant: "destructive"
      });
      return;
    }
    
    const vehicle = await searchVehicleByPlate(plateNumber.trim(), state);
    
    if (vehicle) {
      onVehicleFound(vehicle);
      toast({
        title: "Vehicle Found",
        description: `${vehicle.extendedData?.makeDescription || ""} ${vehicle.extendedData?.model || ""}`,
      });
    }
  };

  return (
    <div className="p-4 bg-muted/40 rounded-lg border">
      <h3 className="text-lg font-medium mb-4">Vehicle Lookup</h3>
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="plateNumber">Registration Number</Label>
            <Input
              id="plateNumber" 
              value={plateNumber} 
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="e.g. ABC123"
            />
          </div>
          
          <div>
            <Label htmlFor="state">State</Label>
            <Select value={state} onValueChange={(value) => setState(value as AustralianState)}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NSW">NSW</SelectItem>
                <SelectItem value="VIC">VIC</SelectItem>
                <SelectItem value="QLD">QLD</SelectItem>
                <SelectItem value="WA">WA</SelectItem>
                <SelectItem value="SA">SA</SelectItem>
                <SelectItem value="TAS">TAS</SelectItem>
                <SelectItem value="ACT">ACT</SelectItem>
                <SelectItem value="NT">NT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          {onManualEntry && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onManualEntry}
              className="text-sm"
            >
              Enter Details Manually
            </Button>
          )}
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className={!onManualEntry ? "w-full" : ""}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Look Up Vehicle
              </>
            )}
          </Button>
        </div>
        
        {error && (
          <div className="p-3 mt-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default VehicleLookupForm;
