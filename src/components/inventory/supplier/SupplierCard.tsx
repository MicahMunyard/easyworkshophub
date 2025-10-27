
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Phone, Mail, MapPin, ShoppingCart, Settings } from 'lucide-react';
import { Supplier } from '@/types/inventory';
import quartzLogo from '@/assets/brands/quartz-logo.png';
import totalenergiesLogo from '@/assets/brands/totalenergies-logo.png';
import machproLogo from '@/assets/brands/machpro-logo.svg';
import jlmLogo from '@/assets/brands/jlm-logo.svg';

interface SupplierCardProps {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onNewOrder: (supplier: Supplier) => void;
}

const SupplierCard: React.FC<SupplierCardProps> = ({
  supplier,
  onEdit,
  onDelete,
  onNewOrder
}) => {
  const brandLogos = [
    { src: quartzLogo, alt: 'Quartz' },
    { src: totalenergiesLogo, alt: 'TotalEnergies' },
    { src: machproLogo, alt: 'MachPro' },
    { src: jlmLogo, alt: 'JLM' },
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
                <Badge 
                  variant={supplier.status === 'active' ? 'default' : 'secondary'}
                  className={supplier.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                >
                  {supplier.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{supplier.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{supplier.email}</span>
          </div>
          {supplier.address && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-sm">{supplier.address}</span>
            </div>
          )}
        </div>

        <div className="text-sm">
          <span className="text-muted-foreground">Contact Person:</span>
          <p className="font-medium">{supplier.contactPerson}</p>
        </div>

        {supplier.notes && (
          <div className="text-sm">
            <span className="text-muted-foreground">Notes:</span>
            <p className="text-sm text-gray-600 mt-1">{supplier.notes}</p>
          </div>
        )}

        {/* Brand Logos Grid - Only show for TOLICCS */}
        {supplier.name.includes('TOLICCS') && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-2">Available Brands</div>
            <div className="grid grid-cols-4 gap-2">
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
        )}

        <div className="flex flex-col gap-2 pt-2">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(supplier)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDelete(supplier)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          {/* New Order button for manual suppliers */}
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

export default SupplierCard;
