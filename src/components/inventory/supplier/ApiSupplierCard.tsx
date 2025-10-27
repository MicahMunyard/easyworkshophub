
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, CheckCircle, Edit, FileText, ShoppingCart } from 'lucide-react';
import { Supplier } from '@/types/inventory';
import ntkLogo from '@/assets/brands/ntk-logo.jpg';
import ngkLogo from '@/assets/brands/ngk-logo.jpg';
import wesfilLogo from '@/assets/brands/wesfil-logo.jpg';
import superproLogo from '@/assets/brands/superpro-logo.jpg';
import rycoLogo from '@/assets/brands/ryco-logo.jpg';
import roadsafeLogo from '@/assets/brands/roadsafe-logo.jpg';
import protexLogo from '@/assets/brands/protex-logo.jpg';
import projectaLogo from '@/assets/brands/projecta-logo.jpg';
import penriteLogo from '@/assets/brands/penrite-logo.jpg';
import patLogo from '@/assets/brands/pat-logo.jpg';
import milwaukeeLogo from '@/assets/brands/milwaukee-logo.jpg';
import kybLogo from '@/assets/brands/kyb-logo.jpg';
import jasLogo from '@/assets/brands/jas-logo.png';
import fuchsLogo from '@/assets/brands/fuchs-logo.jpg';
import exedyLogo from '@/assets/brands/exedy-logo.png';
import endurantLogo from '@/assets/brands/endurant-logo.jpg';
import dbaLogo from '@/assets/brands/dba-logo.png';
import daycoLogo from '@/assets/brands/dayco-logo.png';
import chicaneLogo from '@/assets/brands/chicane-logo.png';
import narvaLogo from '@/assets/brands/narva-logo.jpg';

interface ApiSupplierCardProps {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onGetQuote: (supplier: Supplier) => void;
  onNewOrder: (supplier: Supplier) => void;
}

const ApiSupplierCard: React.FC<ApiSupplierCardProps> = ({
  supplier,
  onEdit,
  onDelete,
  onGetQuote,
  onNewOrder
}) => {
  const isConnected = supplier.apiConfig?.isConnected || false;

  const brandLogos = [
    { src: ntkLogo, alt: 'NTK' },
    { src: ngkLogo, alt: 'NGK' },
    { src: wesfilLogo, alt: 'Wesfil' },
    { src: superproLogo, alt: 'SuperPro' },
    { src: rycoLogo, alt: 'Ryco' },
    { src: roadsafeLogo, alt: 'RoadSafe' },
    { src: protexLogo, alt: 'Protex' },
    { src: projectaLogo, alt: 'Projecta' },
    { src: penriteLogo, alt: 'Penrite' },
    { src: patLogo, alt: 'PAT' },
    { src: milwaukeeLogo, alt: 'Milwaukee' },
    { src: kybLogo, alt: 'KYB' },
    { src: jasLogo, alt: 'JAS Oceania' },
    { src: fuchsLogo, alt: 'Fuchs' },
    { src: exedyLogo, alt: 'Exedy' },
    { src: endurantLogo, alt: 'Endurant' },
    { src: dbaLogo, alt: 'DBA' },
    { src: daycoLogo, alt: 'Dayco' },
    { src: chicaneLogo, alt: 'Chicane' },
    { src: narvaLogo, alt: 'Narva' },
  ];

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {supplier.logoUrl ? (
              <img 
                src={supplier.logoUrl} 
                alt={`${supplier.name} logo`}
                className="w-12 h-12 object-contain rounded"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                <Settings className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">{supplier.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{supplier.category}</Badge>
                {isConnected && (
                  <Badge 
                    variant="default"
                    className="flex items-center gap-1 bg-green-100 text-green-800"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Connected
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="text-sm">
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground">Contact:</span>
              <p className="font-medium">{supplier.contactPerson}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <p className="font-medium text-sm break-words">{supplier.email}</p>
            </div>
          </div>
        </div>

        {supplier.apiConfig && (
          <div className="text-sm">
            <span className="text-muted-foreground">API Type:</span>
            <p className="font-medium capitalize">{supplier.apiConfig.type}</p>
          </div>
        )}

        {/* Brand Logos Grid */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-2">Available Brands</div>
          <div className="grid grid-cols-5 gap-2">
            {brandLogos.map((logo, index) => (
              <div key={index} className="bg-background border rounded p-1 flex items-center justify-center">
                <img 
                  src={logo.src} 
                  alt={logo.alt}
                  className="w-full h-8 object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(supplier)}
            className="w-full"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          {/* Get Quote button for API suppliers */}
          <Button 
            onClick={() => onGetQuote(supplier)}
            className="w-full"
            variant="outline"
          >
            <FileText className="h-4 w-4 mr-2" />
            Get Quote
          </Button>
          
          {/* New Order button for API suppliers (EzyParts flow) */}
          <Button 
            onClick={() => onNewOrder(supplier)}
            className="w-full"
            variant="default"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiSupplierCard;
