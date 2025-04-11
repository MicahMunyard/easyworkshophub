
import { useState } from "react";
import { nevdisService } from "@/services/nevdisService";
import { 
  VehicleReportRequest, 
  Vehicle,
  AustralianState
} from "@/types/nevdis";

interface UseVehicleSearchReturn {
  searchVehicleByPlate: (plate: string, state: AustralianState) => Promise<Vehicle | null>;
  searchVehicleByVin: (vin: string) => Promise<Vehicle | null>;
  isLoading: boolean;
  error: string | null;
  vehicle: Vehicle | null;
}

export const useVehicleSearch = (): UseVehicleSearchReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  
  // Default products to request - can be customized based on needs
  const defaultProducts = [
    "VEHICLE_AGE",
    "EXTENDED_DATA",
    "HIGH_PERFORMANCE_INFO",
    "REGISTRATION"
  ];
  
  /**
   * Search for a vehicle by plate number and state
   */
  const searchVehicleByPlate = async (plate: string, state: AustralianState): Promise<Vehicle | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const request: VehicleReportRequest = {
        plate,
        state,
        products: defaultProducts
      };
      
      const response = await nevdisService.generateVehicleReport(request);
      
      if (response.result.responseCode === "SUCCESS" && response.result.vehicles && response.result.vehicles.length > 0) {
        const foundVehicle = response.result.vehicles[0];
        setVehicle(foundVehicle);
        return foundVehicle;
      } else {
        setError("No vehicle found matching this plate number");
        setVehicle(null);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      setVehicle(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Search for a vehicle by VIN
   */
  const searchVehicleByVin = async (vin: string): Promise<Vehicle | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const request: VehicleReportRequest = {
        vin,
        products: defaultProducts
      };
      
      const response = await nevdisService.generateVehicleReport(request);
      
      if (response.result.responseCode === "SUCCESS" && response.result.vehicles && response.result.vehicles.length > 0) {
        const foundVehicle = response.result.vehicles[0];
        setVehicle(foundVehicle);
        return foundVehicle;
      } else {
        setError("No vehicle found matching this VIN");
        setVehicle(null);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      setVehicle(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    searchVehicleByPlate,
    searchVehicleByVin,
    isLoading,
    error,
    vehicle
  };
};
