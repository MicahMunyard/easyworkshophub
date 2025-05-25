
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { YEARS } from './constants';

interface DetailsSearchProps {
  onSearch: (searchData: any) => void;
  isSearching: boolean;
}

export const DetailsSearchForm: React.FC<DetailsSearchProps> = ({ onSearch, isSearching }) => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [seriesChassis, setSeriesChassis] = useState('');
  const [engine, setEngine] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (make && model) {
      onSearch({ 
        make, 
        model, 
        year: year ? parseInt(year) : undefined,
        vehicleId: vehicleId ? parseInt(vehicleId) : undefined,
        seriesChassis,
        engine
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="make">Make</Label>
          <Input
            id="make"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="e.g. Toyota"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. Corolla"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Select onValueChange={setYear} value={year}>
            <SelectTrigger id="year">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {YEARS.map((yearOption) => (
                <SelectItem key={yearOption} value={yearOption}>
                  {yearOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="vehicleId">Vehicle ID (Optional)</Label>
          <Input
            id="vehicleId"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            placeholder="EzyParts Vehicle ID"
            type="number"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="seriesChassis">Series/Chassis (Optional)</Label>
          <Input
            id="seriesChassis"
            value={seriesChassis}
            onChange={(e) => setSeriesChassis(e.target.value)}
            placeholder="Series or Chassis Code"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="engine">Engine (Optional)</Label>
          <Input
            id="engine"
            value={engine}
            onChange={(e) => setEngine(e.target.value)}
            placeholder="Engine Type/Size"
          />
        </div>
      </div>
      
      <Button type="submit" disabled={isSearching || !make || !model} className="w-full">
        {isSearching ? 'Searching...' : 'Search Vehicle'}
      </Button>
    </form>
  );
};
