
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AUSTRALIAN_STATES } from './constants';
import type { RegistrationSearch } from './types';

interface Props {
  values: RegistrationSearch;
  onChange: (values: RegistrationSearch) => void;
}

export const RegistrationSearchForm: React.FC<Props> = ({ values, onChange }) => {
  const handleRegoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...values,
      regoNumber: e.target.value
    });
  };

  const handleStateChange = (state: string) => {
    onChange({
      ...values,
      state
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="regoNumber">Registration Number</Label>
        <Input
          id="regoNumber"
          value={values.regoNumber}
          onChange={handleRegoChange}
          placeholder="Enter vehicle registration"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="state">State</Label>
        <Select onValueChange={handleStateChange} value={values.state}>
          <SelectTrigger id="state">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {AUSTRALIAN_STATES.map((state) => (
              <SelectItem key={state.value} value={state.value}>
                {state.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

