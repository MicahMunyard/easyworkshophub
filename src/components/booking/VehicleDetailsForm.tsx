
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookingType } from "@/types/booking";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AustralianState } from '@/types/nevdis';

interface VehicleDetailsFormProps {
  initialDetails?: BookingType['vehicleDetails'];
  onSubmit: (details: BookingType['vehicleDetails']) => void;
  onCancel: () => void;
}

const VehicleDetailsForm: React.FC<VehicleDetailsFormProps> = ({ 
  initialDetails, 
  onSubmit, 
  onCancel 
}) => {
  const [details, setDetails] = useState<BookingType['vehicleDetails']>(
    initialDetails || {
      make: '',
      model: '',
      year: '',
      vin: '',
      color: '',
      bodyType: '',
      plateNumber: '',
      state: 'NSW'
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStateChange = (value: string) => {
    setDetails(prev => ({
      ...prev,
      state: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(details);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Vehicle Details</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter the vehicle details manually.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="plateNumber">Registration Number</Label>
            <Input
              id="plateNumber"
              name="plateNumber"
              value={details.plateNumber}
              onChange={handleChange}
              placeholder="e.g. ABC123"
            />
          </div>
          
          <div>
            <Label htmlFor="state">Registration State</Label>
            <Select value={details.state} onValueChange={handleStateChange}>
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
          
          <div>
            <Label htmlFor="make">Make</Label>
            <Input
              id="make"
              name="make"
              value={details.make}
              onChange={handleChange}
              placeholder="e.g. Toyota"
            />
          </div>
          
          <div>
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              name="model"
              value={details.model}
              onChange={handleChange}
              placeholder="e.g. Corolla"
            />
          </div>
          
          <div>
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              name="year"
              value={details.year}
              onChange={handleChange}
              placeholder="e.g. 2020"
            />
          </div>
          
          <div>
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              name="color"
              value={details.color}
              onChange={handleChange}
              placeholder="e.g. Silver"
            />
          </div>
          
          <div>
            <Label htmlFor="bodyType">Body Type</Label>
            <Input
              id="bodyType"
              name="bodyType"
              value={details.bodyType}
              onChange={handleChange}
              placeholder="e.g. Sedan"
            />
          </div>
          
          <div>
            <Label htmlFor="vin">VIN</Label>
            <Input
              id="vin"
              name="vin"
              value={details.vin}
              onChange={handleChange}
              placeholder="e.g. JM0GD102200200992"
            />
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Back to Lookup
          </Button>
          
          <Button type="submit">
            Save Vehicle Details
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VehicleDetailsForm;
