
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, Package, Car } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const EzyPartsDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">EzyParts Integration</h1>
        <Button onClick={() => navigate('/ezyparts/search')}>
          <Search className="mr-2 h-4 w-4" />
          Search Parts
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
            <Button onClick={() => navigate('/ezyparts/search')} className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Start Vehicle Search
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
