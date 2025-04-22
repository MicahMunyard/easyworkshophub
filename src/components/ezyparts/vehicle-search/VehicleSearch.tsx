import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEzyParts } from '@/contexts/EzyPartsContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegistrationSearchForm } from './RegistrationSearchForm';
import { DetailsSearchForm } from './DetailsSearchForm';
import { ConfigurationAlert } from './ConfigurationAlert';
import type { RegistrationSearch, DetailsSearch } from './types';

const VehicleSearch: React.FC = () => {
  const navigate = useNavigate();
  const { generateEzyPartsUrl, credentials } = useEzyParts();
  
  const isConfigured = credentials.clientId && 
                      credentials.clientSecret && 
                      credentials.accountId && 
                      credentials.username && 
                      credentials.password;
  
  const [searchMethod, setSearchMethod] = useState<'registration' | 'details'>('registration');
  const [registrationSearch, setRegistrationSearch] = useState<RegistrationSearch>({
    regoNumber: '',
    state: '',
    isRegoSearch: true
  });
  const [detailsSearch, setDetailSearch] = useState<DetailsSearch>({
    vehicleId: 0,
    make: '',
    model: '',
    year: 0,
    seriesChassis: '',
    engine: ''
  });
  const [returnToApp, setReturnToApp] = useState(true);
  
  const handleSearch = useCallback(() => {
    if (!isConfigured) {
      navigate('/config');
      return;
    }
    
    const baseUrl = window.location.origin;
    const returnUrl = returnToApp ? `${baseUrl}/ezyparts/quote` : '';
    
    let url = '';
    if (searchMethod === 'registration') {
      if (!registrationSearch.regoNumber || !registrationSearch.state) {
        alert('Please enter both registration number and state.');
        return;
      }
      
      url = generateEzyPartsUrl({
        ...registrationSearch,
        quoteUrl: `${baseUrl}/api/ezyparts/quote`,
        returnUrl
      });
    } else {
      if (!detailsSearch.make || !detailsSearch.model) {
        alert('Please enter at least make and model.');
        return;
      }
      
      url = generateEzyPartsUrl({
        ...detailsSearch,
        quoteUrl: `${baseUrl}/api/ezyparts/quote`,
        returnUrl
      });
    }
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(url);
      iframeDoc.close();
    }
    
    setTimeout(() => {
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 5000);
  }, [
    searchMethod, 
    registrationSearch, 
    detailsSearch, 
    generateEzyPartsUrl, 
    navigate, 
    isConfigured,
    returnToApp
  ]);

  if (!isConfigured) {
    return <ConfigurationAlert />;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Find Vehicle</CardTitle>
        <CardDescription>
          Search for a vehicle by registration or details to find parts in EzyParts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={searchMethod} onValueChange={(value) => setSearchMethod(value as 'registration' | 'details')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="registration">Search by Registration</TabsTrigger>
            <TabsTrigger value="details">Search by Vehicle Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="registration" className="space-y-4 mt-4">
            <RegistrationSearchForm 
              values={registrationSearch}
              onChange={setRegistrationSearch}
            />
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4 mt-4">
            <DetailsSearchForm
              values={detailsSearch}
              onChange={setDetailSearch}
            />
          </TabsContent>
        </Tabs>
        
        <div className="flex items-center space-x-2 mt-6">
          <Switch
            id="returnToApp"
            checked={returnToApp}
            onCheckedChange={setReturnToApp}
          />
          <Label htmlFor="returnToApp">
            Return to WorkshopBase after selecting parts
          </Label>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button onClick={handleSearch} className="px-6">
          Search EzyParts
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VehicleSearch;
