
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AUSTRALIAN_STATES } from './constants';

interface RegistrationSearchProps {
  onSearch: (searchData: any) => void;
  isSearching: boolean;
}

export const RegistrationSearchForm: React.FC<RegistrationSearchProps> = ({ onSearch, isSearching }) => {
  const [registration, setRegistration] = useState('');
  const [state, setState] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (registration && state) {
      onSearch({ registration, state });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="regoNumber">Registration Number</Label>
          <Input
            id="regoNumber"
            value={registration}
            onChange={(e) => setRegistration(e.target.value)}
            placeholder="Enter vehicle registration"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Select onValueChange={setState} value={state} required>
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
      
      <Button type="submit" disabled={isSearching || !registration || !state} className="w-full">
        {isSearching ? 'Searching...' : 'Search Vehicle'}
      </Button>
    </form>
  );
};
