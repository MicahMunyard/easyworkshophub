
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEzyParts } from '@/contexts/EzyPartsContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RegistrationSearchForm } from './RegistrationSearchForm';
import { DetailsSearchForm } from './DetailsSearchForm';
import { ConfigurationAlert } from './ConfigurationAlert';
import { useToast } from '@/hooks/use-toast';
import type { RegistrationSearch, DetailsSearch } from './types';

const VehicleSearch: React.FC = () => {
  const navigate = useNavigate();
  const { credentials, isProduction } = useEzyParts();
  const { toast } = useToast();
  
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isEzyPartsWindowOpen, setIsEzyPartsWindowOpen] = useState(false);
  
  // Check if credentials are properly configured
  const isConfigured = credentials.clientId && 
                      credentials.clientSecret && 
                      credentials.accountId && 
                      credentials.username && 
                      credentials.password;

  // Monitor EzyParts window and handle closure
  useEffect(() => {
    if (isEzyPartsWindowOpen) {
      const interval = setInterval(() => {
        try {
          if (window.ezyPartsWindow && window.ezyPartsWindow.closed) {
            clearInterval(interval);
            setIsEzyPartsWindowOpen(false);
            setIsSubmitting(false);
            console.log('EzyParts window was closed by user');
          }
        } catch (e) {
          // Handle potential security errors
          clearInterval(interval);
          setIsEzyPartsWindowOpen(false);
          setIsSubmitting(false);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isEzyPartsWindowOpen]);
  
  // Add window reference to global scope
  useEffect(() => {
    // @ts-ignore
    window.ezyPartsWindow = null;
  }, []);
  
  const validateInput = () => {
    if (searchMethod === 'registration') {
      if (!registrationSearch.regoNumber) {
        toast({
          title: 'Missing Registration',
          description: 'Please enter a registration number.',
          variant: 'destructive'
        });
        return false;
      }
      if (!registrationSearch.state) {
        toast({
          title: 'Missing State',
          description: 'Please select a state for the registration.',
          variant: 'destructive' 
        });
        return false;
      }
    } else {
      if (!detailsSearch.make || !detailsSearch.model) {
        toast({
          title: 'Missing Information',
          description: 'Please enter at least make and model.',
          variant: 'destructive' 
        });
        return false;
      }
    }
    return true;
  };
  
  const handleSearch = useCallback(() => {
    if (!isConfigured) {
      navigate('/ezyparts/config');
      return;
    }
    
    if (!validateInput()) {
      return;
    }
    
    setIsSubmitting(true);
    setConnectionError(null);
    
    try {
      // Get the full URL for the quote endpoint
      const baseUrl = window.location.origin;
      
      // Improved URL handling with more specific routes to avoid edge function confusion
      const quoteUrl = `${baseUrl}/api/ezyparts-quote`;
      
      // Log the exact URL for debugging purposes
      console.log('Setting quoteUrl to:', quoteUrl);
      
      // Use window.location.origin and pathname to form a specific return URL
      // This ensures we return to the right place in the app
      const returnUrl = returnToApp ? `${baseUrl}/ezyparts/quote` : '';
      console.log('Setting returnUrl to:', returnUrl);
      
      // Debug info for troubleshooting
      console.log('EzyParts Search Parameters:', {
        accountId: credentials.accountId ? 'set' : 'not set',
        username: credentials.username ? 'set' : 'not set',
        quoteUrl,
        returnUrl,
        isProduction,
        searchMethod
      });
      
      // Create a proper form element that will be submitted
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = isProduction ? 
        'https://ezyparts.burson.com.au/burson/auth' : 
        'https://ezypartsqa.burson.com.au/burson/auth';
      
      // Use window.open to create a popup window for the EzyParts session
      // @ts-ignore
      window.ezyPartsWindow = window.open('', 'ezyPartsWindow', 'width=1024,height=768');
      // @ts-ignore
      if (!window.ezyPartsWindow) {
        toast({
          title: 'Popup Blocked',
          description: 'Please allow popups for this site to use EzyParts.',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }
      
      setIsEzyPartsWindowOpen(true);
      // @ts-ignore
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
      createField('quoteUrl', quoteUrl);
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
      
      // Add form to DOM, submit, and then remove
      document.body.appendChild(form);
      
      // Log the final form content before submission
      const formData = new FormData(form);
      const formParams: {[key: string]: string} = {};
      formData.forEach((value, key) => {
        formParams[key] = value.toString();
      });
      console.log('Submitting EzyParts search form with parameters:', formParams);
      
      form.submit();
      
      // Remove the form after submission
      setTimeout(() => {
        document.body.removeChild(form);
      }, 100);
      
      toast({
        title: 'Connecting to EzyParts',
        description: 'EzyParts will open in a new window. Please check your browser if it doesn\'t appear.'
      });
    } catch (error) {
      console.error('Error launching EzyParts:', error);
      setConnectionError(error instanceof Error ? error.message : 'Unknown error launching EzyParts');
      setIsSubmitting(false);
      
      toast({
        title: 'Error Connecting to EzyParts',
        description: 'There was a problem launching EzyParts. Please try again.',
        variant: 'destructive'
      });
    }
  }, [
    searchMethod, 
    registrationSearch, 
    detailsSearch, 
    navigate, 
    isConfigured,
    returnToApp,
    credentials,
    isProduction,
    toast
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
        {connectionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        )}
      
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
        <Button 
          onClick={handleSearch} 
          className="px-6"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            'Search EzyParts'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VehicleSearch;
