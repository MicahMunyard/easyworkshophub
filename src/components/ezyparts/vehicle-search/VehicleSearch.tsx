
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
  const { credentials, isProduction } = useEzyParts();
  
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
      navigate('/ezyparts/config');
      return;
    }
    
    const baseUrl = window.location.origin;
    const returnUrl = returnToApp ? `${baseUrl}/ezyparts/quote` : '';
    
    // Validate inputs
    if (searchMethod === 'registration') {
      if (!registrationSearch.regoNumber || !registrationSearch.state) {
        alert('Please enter both registration number and state.');
        return;
      }
    } else {
      if (!detailsSearch.make || !detailsSearch.model) {
        alert('Please enter at least make and model.');
        return;
      }
    }
    
    // Create a proper form element that will be submitted
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = isProduction ? 
      'https://ezyparts.burson.com.au/burson/auth' : 
      'https://ezypartsqa.burson.com.au/burson/auth';
    
    // Use window.open to create a popup window for the EzyParts session
    const ezyPartsWindow = window.open('', 'ezyPartsWindow', 'width=1024,height=768');
    if (!ezyPartsWindow) {
      alert('Popup blocked! Please allow popups for this site to use EzyParts.');
      return;
    }
    
    form.target = 'ezyPartsWindow'; // Target the popup window
    
    // Create and add the required fields
    const createField = (name: string, value: string | number | boolean | undefined) => {
      if (value !== undefined && value !== null && value !== '') {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value.toString();
        form.appendChild(input);
      }
    };
    
    // Add mandatory authentication parameters
    createField('accountId', credentials.accountId);
    createField('username', credentials.username);
    createField('password', credentials.password);
    
    // Add the quote URL and return URL
    createField('quoteUrl', `${baseUrl}/api/ezyparts/quote`);
    createField('returnUrl', returnUrl);
    createField('userAgent', 'Mozilla/5.0');
    
    // Add search specific fields
    if (searchMethod === 'registration') {
      createField('regoNumber', registrationSearch.regoNumber);
      createField('state', registrationSearch.state);
      createField('isRegoSearch', true);
    } else {
      createField('make', detailsSearch.make);
      createField('model', detailsSearch.model);
      createField('year', detailsSearch.year);
      createField('vehicleId', detailsSearch.vehicleId || undefined);
      createField('seriesChassis', detailsSearch.seriesChassis);
      createField('engine', detailsSearch.engine);
      createField('isRegoSearch', false);
    }
    
    console.log('Submitting EzyParts search form with parameters:', {
      accountId: credentials.accountId,
      searchType: searchMethod,
      returnUrl
    });
    
    // Add to DOM, submit, and then remove
    document.body.appendChild(form);
    form.submit();
    
    // Remove the form after submission
    setTimeout(() => {
      document.body.removeChild(form);
    }, 100);
  }, [
    searchMethod, 
    registrationSearch, 
    detailsSearch, 
    navigate, 
    isConfigured,
    returnToApp,
    credentials,
    isProduction
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
