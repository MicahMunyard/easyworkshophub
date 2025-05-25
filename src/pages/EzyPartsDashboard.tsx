
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, Package, Car } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const EzyPartsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleStartVehicleSearch = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access EzyParts vehicle search.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Call the EzyParts search function to get the authentication portal URL
      const { data, error } = await supabase.functions.invoke('ezyparts-search', {
        body: {
          user_id: user.id,
          search_params: {} // Empty params will show the general search interface
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
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">EzyParts Integration</h1>
        <Button onClick={handleStartVehicleSearch}>
          <Search className="mr-2 h-4 w-4" />
          Start Vehicle Search
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Search
            </CardTitle>
            <CardDescription>
              Search for parts by vehicle registration or details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Use EzyParts to find the right parts for your customer's vehicle. Search by registration number or vehicle details.
            </p>
            <Button onClick={handleStartVehicleSearch} className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Open EzyParts Portal
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Parts Integration
            </CardTitle>
            <CardDescription>
              Parts automatically added to your inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              When you click "Send to WMS" in EzyParts, selected parts are automatically added to your WorkshopBase inventory.
            </p>
            <Button variant="outline" onClick={() => navigate('/inventory')} className="w-full">
              <Package className="mr-2 h-4 w-4" />
              View Inventory
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EzyPartsDashboard;
