
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Car, Search, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RegistrationSearchForm } from './RegistrationSearchForm';
import { DetailsSearchForm } from './DetailsSearchForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const VehicleSearch: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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

  const handleSearch = async (searchData: any) => {
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ezyparts-search', {
        body: {
          user_id: user.id,
          search_params: searchData
        }
      });

      if (error) throw error;

      if (data.redirect_url) {
        // Open EzyParts in new window with the generated URL
        window.open(data.redirect_url, '_blank', 'width=1200,height=800');
        
        toast({
          title: "EzyParts Opened",
          description: "Search for parts and click 'Send to WMS' to add them to your inventory.",
        });
      } else {
        throw new Error(data.error || 'Failed to generate EzyParts URL');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to open EzyParts search.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Car className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Vehicle Search</h1>
          <p className="text-muted-foreground">Search for vehicle parts using EzyParts</p>
        </div>
      </div>

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
