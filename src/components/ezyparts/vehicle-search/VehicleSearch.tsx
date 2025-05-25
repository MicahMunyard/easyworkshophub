
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Car, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ConfigurationAlert } from './ConfigurationAlert';
import { RegistrationSearchForm } from './RegistrationSearchForm';
import { DetailsSearchForm } from './DetailsSearchForm';

const VehicleSearch: React.FC = () => {
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access EzyParts vehicle search.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSearch = (searchData: any) => {
    setIsSearching(true);
    
    // Include user ID in the webhook URL for EzyParts
    const webhookUrl = `https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/ezyparts-quote?user_id=${user.id}`;
    
    // Construct the EzyParts URL with search parameters and webhook URL
    let ezyPartsUrl = 'https://staging.ezyparts.net.au/vehiclesearch?';
    
    // Add search parameters
    const params = new URLSearchParams();
    if (searchData.registration) {
      params.append('rego', searchData.registration);
      params.append('state', searchData.state);
    } else {
      params.append('make', searchData.make);
      params.append('model', searchData.model);
      if (searchData.year) params.append('year', searchData.year);
      if (searchData.engine) params.append('engine', searchData.engine);
      if (searchData.variant) params.append('variant', searchData.variant);
    }
    
    // Add the webhook URL for "Send to WMS" functionality
    params.append('wms_webhook', encodeURIComponent(webhookUrl));
    
    ezyPartsUrl += params.toString();
    
    console.log('Opening EzyParts with URL:', ezyPartsUrl);
    
    // Open EzyParts in a new window
    window.open(ezyPartsUrl, '_blank', 'width=1200,height=800');
    
    setIsSearching(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Car className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Vehicle Search</h1>
          <p className="text-muted-foreground">Search for vehicle parts using EzyParts</p>
        </div>
      </div>

      <ConfigurationAlert />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search for Vehicle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="registration" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="registration">By Registration</TabsTrigger>
              <TabsTrigger value="details">By Vehicle Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="registration">
              <RegistrationSearchForm onSearch={handleSearch} isSearching={isSearching} />
            </TabsContent>
            
            <TabsContent value="details">
              <DetailsSearchForm onSearch={handleSearch} isSearching={isSearching} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          After searching, select the parts you need in EzyParts and click "Send to WMS" to add them to your WorkshopBase inventory.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default VehicleSearch;
