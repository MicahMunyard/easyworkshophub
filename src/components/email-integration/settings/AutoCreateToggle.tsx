
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AutoCreateToggleProps {
  autoCreateBookings: boolean;
  setAutoCreateBookings: (value: boolean) => void;
  disabled: boolean;
}

const AutoCreateToggle: React.FC<AutoCreateToggleProps> = ({
  autoCreateBookings,
  setAutoCreateBookings,
  disabled
}) => {
  return (
    <div className="flex items-center justify-between space-y-0 pt-4">
      <div className="space-y-0.5">
        <Label htmlFor="auto-create">Automatic Booking Creation</Label>
        <p className="text-xs text-muted-foreground">
          Automatically create bookings from emails when possible
        </p>
      </div>
      <Switch
        id="auto-create"
        checked={autoCreateBookings}
        onCheckedChange={setAutoCreateBookings}
        disabled={disabled}
      />
    </div>
  );
};

export default AutoCreateToggle;
