
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { YEARS } from './constants';
import type { DetailsSearch } from './types';

interface Props {
  values: DetailsSearch;
  onChange: (values: DetailsSearch) => void;
}

export const DetailsSearchForm: React.FC<Props> = ({ values, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...values,
      [name]: value
    });
  };

  const handleYearChange = (year: string) => {
    onChange({
      ...values,
      year
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="make">Make</Label>
          <Input
            id="make"
            name="make"
            value={values.make}
            onChange={handleInputChange}
            placeholder="e.g. Toyota"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            name="model"
            value={values.model}
            onChange={handleInputChange}
            placeholder="e.g. Corolla"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Select onValueChange={handleYearChange} value={values.year}>
            <SelectTrigger id="year">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {YEARS.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="vehicleId">Vehicle ID (Optional)</Label>
          <Input
            id="vehicleId"
            name="vehicleId"
            value={values.vehicleId}
            onChange={handleInputChange}
            placeholder="EzyParts Vehicle ID"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="seriesChassis">Series/Chassis (Optional)</Label>
          <Input
            id="seriesChassis"
            name="seriesChassis"
            value={values.seriesChassis}
            onChange={handleInputChange}
            placeholder="Series or Chassis Code"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="engine">Engine (Optional)</Label>
          <Input
            id="engine"
            name="engine"
            value={values.engine}
            onChange={handleInputChange}
            placeholder="Engine Type/Size"
          />
        </div>
      </div>
    </div>
  );
};

