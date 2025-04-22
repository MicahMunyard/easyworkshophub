
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CarFront, Search } from 'lucide-react';

interface VehicleSearchCardProps {
  isConfigured: boolean;
  apiStatus: 'loading' | 'connected' | 'error';
}

export const VehicleSearchCard: React.FC<VehicleSearchCardProps> = ({ isConfigured, apiStatus }) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CarFront className="mr-2 h-5 w-5" />
          Find Vehicle
        </CardTitle>
        <CardDescription>Search for a vehicle by registration or details</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Look up a vehicle by registration number or details to find compatible parts in the EzyParts catalog.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => navigate('/ezyparts/search')}
          disabled={!isConfigured || apiStatus !== 'connected'}
        >
          <Search className="mr-2 h-4 w-4" />
          Search Vehicle
        </Button>
      </CardFooter>
    </Card>
  );
};
