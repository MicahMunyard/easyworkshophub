import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import VehicleLookupForm from "@/components/booking/VehicleLookupForm";
import VehicleDetailsForm from "@/components/booking/VehicleDetailsForm";
import { Button } from "@/components/ui/button";
import { BookingType } from "@/types/booking";
import { Vehicle } from "@/types/nevdis";

interface VehicleTabProps {
  isManualEntry: boolean;
  initialVehicleDetails?: BookingType['vehicleDetails'];
  onVehicleFound: (vehicle: Vehicle) => void;
  onManualEntry: () => void;
  onVehicleDetailsSubmit: (details: BookingType['vehicleDetails']) => void;
  onCancel: () => void;
}

const VehicleTab: React.FC<VehicleTabProps> = ({
  isManualEntry,
  initialVehicleDetails,
  onVehicleFound,
  onManualEntry,
  onVehicleDetailsSubmit,
  onCancel
}) => {
  return (
    <TabsContent value="vehicle">
      {!isManualEntry ? (
        <VehicleLookupForm 
          onVehicleFound={onVehicleFound} 
          onManualEntry={onManualEntry}
        />
      ) : (
        <VehicleDetailsForm 
          initialDetails={initialVehicleDetails}
          onSubmit={onVehicleDetailsSubmit}
          onCancel={() => onCancel()}
        />
      )}
      
      <div className="flex justify-end mt-4">
        <Button 
          onClick={onCancel}
          variant="outline"
        >
          Cancel Vehicle Update
        </Button>
      </div>
    </TabsContent>
  );
};

export default VehicleTab;
