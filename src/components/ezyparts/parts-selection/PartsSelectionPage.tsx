
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PartsSelectionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vehicleInfo, setVehicleInfo] = useState<string>('');
  
  useEffect(() => {
    // Extract vehicle information from URL parameters
    const rego = searchParams.get('rego');
    const state = searchParams.get('state');
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const year = searchParams.get('year');
    
    if (rego && state) {
      setVehicleInfo(`${rego} (${state})`);
    } else if (make && model) {
      setVehicleInfo(`${make} ${model}${year ? ` (${year})` : ''}`);
    }
    
    // Show success message when arriving from EzyParts
    if (searchParams.get('ezyparts_products') === 'added') {
      toast({
        title: 'Parts Added Successfully',
        description: 'Selected parts have been added to your inventory and are ready for job invoicing.',
      });
    }
  }, [searchParams, toast]);

  const handleBackToSearch = () => {
    navigate('/ezyparts/search');
  };

  const handleViewInventory = () => {
    navigate('/inventory?tab=inventory');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={handleBackToSearch} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vehicle Search
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Parts Selection</h1>
          {vehicleInfo && (
            <p className="text-muted-foreground">Vehicle: {vehicleInfo}</p>
          )}
        </div>
      </div>

      {/* Success state when parts have been added */}
      {searchParams.get('ezyparts_products') === 'added' && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Parts Successfully Added</AlertTitle>
          <AlertDescription className="text-green-700">
            The selected parts from EzyParts have been added to your inventory and are ready for use in job invoicing.
          </AlertDescription>
        </Alert>
      )}

      {/* Waiting for EzyParts selection */}
      {!searchParams.get('ezyparts_products') && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Package className="h-5 w-5" />
              Waiting for Parts Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">EzyParts Integration Active</AlertTitle>
              <AlertDescription className="text-blue-700">
                <div className="space-y-2">
                  <p>EzyParts should have opened in a new window. If you can't see it, please check for popup blockers.</p>
                  <p className="font-medium">Next steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Select the parts you need in the EzyParts window</li>
                    <li>Add them to your quote</li>
                    <li>Click "Send to WMS" button in EzyParts</li>
                    <li>Parts will automatically appear in your inventory</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-4">
              <Button onClick={handleBackToSearch} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Start New Search
              </Button>
              <Button onClick={handleViewInventory} variant="outline">
                <Package className="mr-2 h-4 w-4" />
                View Current Inventory
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions for using EzyParts */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use EzyParts Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2 font-semibold">1</div>
              <h3 className="font-medium mb-2">Search & Browse</h3>
              <p className="text-sm text-muted-foreground">Find parts for your vehicle using EzyParts' comprehensive catalog</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2 font-semibold">2</div>
              <h3 className="font-medium mb-2">Select Parts</h3>
              <p className="text-sm text-muted-foreground">Add desired parts to your quote and review quantities and pricing</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2 font-semibold">3</div>
              <h3 className="font-medium mb-2">Send to WMS</h3>
              <p className="text-sm text-muted-foreground">Click "Send to WMS" to add parts directly to your WorkshopBase inventory</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartsSelectionPage;
