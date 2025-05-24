
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEzyParts } from '@/contexts/EzyPartsContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShoppingCart, Package } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isEzyPartsWindowOpen, setIsEzyPartsWindowOpen] = useState(false);
  const [supabaseUrl] = useState<string>('https://qyjjbpyqxwrluhymvshn.supabase.co');
  
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
      const baseUrl = window.location.origin;
      const quoteUrl = `${supabaseUrl}/functions/v1/ezyparts-quote`;
      
      // Enhanced return URL that includes vehicle context
      const vehicleContext = searchMethod === 'registration' 
        ? `rego=${encodeURIComponent(registrationSearch.regoNumber)}&state=${encodeURIComponent(registrationSearch.state)}`
        : `make=${encodeURIComponent(detailsSearch.make)}&model=${encodeURIComponent(detailsSearch.model)}&year=${detailsSearch.year}`;
      
      const returnUrl = `${baseUrl}/ezyparts/parts-selection?${vehicleContext}`;
      
      console.log('EzyParts Search Parameters:', {
        accountId: credentials.accountId ? 'set' : 'not set',
        username: credentials.username ? 'set' : 'not set',
        quoteUrl,
        returnUrl,
        isProduction,
        searchMethod,
        vehicleContext
      });
      
      // Create a proper form element that will be submitted
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = isProduction ? 
        'https://ezyparts.burson.com.au/burson/auth' : 
        'https://ezypartsqa.burson.com.au/burson/auth';
      
      // Use window.open to create a popup window for the EzyParts session
      // @ts-ignore
      window.ezyPartsWindow = window.open('', 'ezyPartsWindow', 'width=1200,height=800,scrollbars=yes,resizable=yes');
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
      form.target = 'ezyPartsWindow';
      
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
        description: 'EzyParts will open in a new window. After selecting parts, click "Send to WMS" to add them to your inventory.'
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
    credentials,
    isProduction,
    toast,
    supabaseUrl
  ]);

  if (!isConfigured) {
    return <ConfigurationAlert />;
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Clear Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Package className="h-5 w-5" />
            Find Vehicle Parts
          </CardTitle>
          <CardDescription className="text-blue-700">
            Search for a vehicle to find compatible parts. Selected parts will be added directly to your inventory for job invoicing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-blue-600">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-xs font-semibold">1</div>
              <span>Search Vehicle</span>
            </div>
            <div className="flex-1 h-px bg-blue-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-xs font-semibold">2</div>
              <span>Select Parts in EzyParts</span>
            </div>
            <div className="flex-1 h-px bg-blue-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-xs font-semibold">3</div>
              <span>Add to Inventory</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Vehicle Search</CardTitle>
          <CardDescription>
            Find parts by searching for a specific vehicle
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
                Connecting to EzyParts...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Find Parts in EzyParts
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VehicleSearch;
