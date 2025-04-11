
import React, { useState } from "react";
import { useVehicleSearch } from "@/hooks/vehicles/useVehicleSearch";
import { AustralianState, Vehicle } from "@/types/nevdis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface VehicleDetailsProps {
  vehicle: Vehicle;
}

const VehicleDetails: React.FC<VehicleDetailsProps> = ({ vehicle }) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>
          {vehicle.extendedData?.makeDescription} {vehicle.extendedData?.model}
        </CardTitle>
        <CardDescription>
          {vehicle.vehicleAge?.yearOfManufacture && `${vehicle.vehicleAge.yearOfManufacture} • `}
          {vehicle.extendedData?.colour && `${vehicle.extendedData.colour} • `}
          {vehicle.extendedData?.bodyType}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Vehicle Identification</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {vehicle.identification.plate && (
                <>
                  <div className="text-muted-foreground">Plate</div>
                  <div>{vehicle.identification.plate} {vehicle.identification.state && `(${vehicle.identification.state})`}</div>
                </>
              )}
              {vehicle.identification.vin && (
                <>
                  <div className="text-muted-foreground">VIN</div>
                  <div>{vehicle.identification.vin}</div>
                </>
              )}
              {vehicle.identification.chassis && (
                <>
                  <div className="text-muted-foreground">Chassis</div>
                  <div>{vehicle.identification.chassis}</div>
                </>
              )}
            </div>
          </div>
          
          <Separator />
          
          {vehicle.extendedData && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Vehicle Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {vehicle.extendedData.makeDescription && (
                  <>
                    <div className="text-muted-foreground">Make</div>
                    <div>{vehicle.extendedData.makeDescription}</div>
                  </>
                )}
                {vehicle.extendedData.model && (
                  <>
                    <div className="text-muted-foreground">Model</div>
                    <div>{vehicle.extendedData.model}</div>
                  </>
                )}
                {vehicle.extendedData.modelDescription && (
                  <>
                    <div className="text-muted-foreground">Model Description</div>
                    <div>{vehicle.extendedData.modelDescription}</div>
                  </>
                )}
                {vehicle.extendedData.bodyType && (
                  <>
                    <div className="text-muted-foreground">Body Type</div>
                    <div>{vehicle.extendedData.bodyType}</div>
                  </>
                )}
                {vehicle.extendedData.vehicleType && (
                  <>
                    <div className="text-muted-foreground">Vehicle Type</div>
                    <div>{vehicle.extendedData.vehicleType}</div>
                  </>
                )}
                {vehicle.extendedData.colour && (
                  <>
                    <div className="text-muted-foreground">Color</div>
                    <div>{vehicle.extendedData.colour}</div>
                  </>
                )}
                {vehicle.extendedData.engineNumber && (
                  <>
                    <div className="text-muted-foreground">Engine Number</div>
                    <div>{vehicle.extendedData.engineNumber}</div>
                  </>
                )}
              </div>
            </div>
          )}
          
          {vehicle.vehicleAge && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Age Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {vehicle.vehicleAge.yearOfManufacture && (
                    <>
                      <div className="text-muted-foreground">Year of Manufacture</div>
                      <div>{vehicle.vehicleAge.yearOfManufacture}</div>
                    </>
                  )}
                  {vehicle.vehicleAge.compliancePlate && (
                    <>
                      <div className="text-muted-foreground">Compliance Plate</div>
                      <div>{vehicle.vehicleAge.compliancePlate}</div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
          
          {vehicle.highPerformanceInfo && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Performance Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {vehicle.highPerformanceInfo.power && (
                    <>
                      <div className="text-muted-foreground">Power</div>
                      <div>{vehicle.highPerformanceInfo.power} kW</div>
                    </>
                  )}
                  {vehicle.highPerformanceInfo.weight && (
                    <>
                      <div className="text-muted-foreground">Weight</div>
                      <div>{vehicle.highPerformanceInfo.weight} tonnes</div>
                    </>
                  )}
                  {vehicle.highPerformanceInfo.powerToWeight && (
                    <>
                      <div className="text-muted-foreground">Power to Weight</div>
                      <div>{vehicle.highPerformanceInfo.powerToWeight}</div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
          
          {vehicle.registration && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Registration</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {vehicle.registration.status && (
                    <>
                      <div className="text-muted-foreground">Status</div>
                      <div>{vehicle.registration.status}</div>
                    </>
                  )}
                  {vehicle.registration.expiryDate && (
                    <>
                      <div className="text-muted-foreground">Expiry Date</div>
                      <div>{new Date(vehicle.registration.expiryDate).toLocaleDateString()}</div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => toast({ title: "Feature in development", description: "Creating a job with this vehicle will be available soon." })}>
          Create Job with this Vehicle
        </Button>
      </CardFooter>
    </Card>
  );
};

const VehicleSearch: React.FC = () => {
  const { searchVehicleByPlate, searchVehicleByVin, isLoading, error, vehicle } = useVehicleSearch();
  
  const [plateNumber, setPlateNumber] = useState("");
  const [state, setState] = useState<AustralianState>("NSW");
  const [vinNumber, setVinNumber] = useState("");

  const handlePlateSearch = async () => {
    if (!plateNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a plate number",
        variant: "destructive"
      });
      return;
    }
    await searchVehicleByPlate(plateNumber.trim(), state);
  };

  const handleVinSearch = async () => {
    if (!vinNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a VIN number",
        variant: "destructive"
      });
      return;
    }
    await searchVehicleByVin(vinNumber.trim());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vehicle Search</h1>
        <p className="text-muted-foreground">
          Search for vehicle information using plate number or VIN
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search for a Vehicle</CardTitle>
          <CardDescription>
            Enter a plate number with state or VIN to look up vehicle details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="plate">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="plate">Search by Plate</TabsTrigger>
              <TabsTrigger value="vin">Search by VIN</TabsTrigger>
            </TabsList>
            
            <TabsContent value="plate" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="plateNumber">Plate Number</Label>
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
              <Button 
                onClick={handlePlateSearch} 
                className="w-full md:w-auto"
                disabled={isLoading || !plateNumber.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : "Search Vehicle"}
              </Button>
            </TabsContent>
            
            <TabsContent value="vin" className="space-y-4">
              <div>
                <Label htmlFor="vinNumber">VIN Number</Label>
                <Input 
                  id="vinNumber" 
                  value={vinNumber} 
                  onChange={(e) => setVinNumber(e.target.value)}
                  placeholder="e.g. JM0GD102200200992"
                />
              </div>
              <Button 
                onClick={handleVinSearch} 
                className="w-full md:w-auto"
                disabled={isLoading || !vinNumber.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : "Search Vehicle"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {error && !isLoading && (
        <Card className="border-destructive">
          <CardHeader className="text-destructive">
            <CardTitle>Vehicle Not Found</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {vehicle && !isLoading && <VehicleDetails vehicle={vehicle} />}

      <div className="text-sm text-muted-foreground">
        <p>Test Data: You can try using these example plates/VINs from our test environment:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Plate: CQ7731, State: TAS</li>
          <li>Plate: ATZ192, State: QLD</li>
          <li>VIN: JM0GD102200200992</li>
          <li>VIN: JTHBK262405191074</li>
        </ul>
      </div>
    </div>
  );
};

export default VehicleSearch;
