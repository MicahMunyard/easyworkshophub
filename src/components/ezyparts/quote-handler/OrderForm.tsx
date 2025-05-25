
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SendHorizontal, Package2 } from 'lucide-react';
import { OrderFormValues } from './types';
import { useEzyPartsOrder } from '@/hooks/ezyparts/useEzyPartsOrder';
import { useToast } from '@/hooks/use-toast';

interface OrderFormProps {
  values: OrderFormValues;
  onChange: (values: Partial<OrderFormValues>) => void;
  onSubmit: () => void;
  onBack: () => void;
  disabled: boolean;
  cartItems?: Array<{
    sku: string;
    qty: number;
    nettPriceEach: number;
    retailPriceEa: number;
    partDescription: string;
  }>;
  vehicleData?: {
    encryptedVehicleId?: number;
    rego?: string;
    make?: string;
    model?: string;
  };
}

export const OrderForm: React.FC<OrderFormProps> = ({
  values,
  onChange,
  onSubmit,
  onBack,
  disabled,
  cartItems = [],
  vehicleData
}) => {
  const { submitOrder, isSubmitting } = useEzyPartsOrder();
  const { toast } = useToast();

  const handleEzyPartsOrder = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "No Items to Order",
        description: "Please add items to your cart before submitting an order.",
        variant: "destructive"
      });
      return;
    }

    try {
      const orderData = {
        parts: cartItems.map(item => ({
          qty: item.qty,
          sku: item.sku,
          nettPriceEach: item.nettPriceEach,
          retailPriceEa: item.retailPriceEa
        })),
        purchaseOrder: values.purchaseOrder,
        orderNotes: values.orderNotes,
        deliveryType: values.deliveryType,
        forceOrder: values.forceOrder,
        vehicleData
      };

      await submitOrder(orderData);
      
      // Call the original onSubmit for any additional handling
      onSubmit();
    } catch (error) {
      console.error('Failed to submit EzyParts order:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package2 className="h-5 w-5" />
          Order Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="purchaseOrder">Purchase Order #</Label>
          <Input
            id="purchaseOrder"
            value={values.purchaseOrder}
            onChange={(e) => onChange({ purchaseOrder: e.target.value })}
            placeholder="Enter purchase order number"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="orderNotes">Order Notes</Label>
          <Textarea
            id="orderNotes"
            value={values.orderNotes}
            onChange={(e) => onChange({ orderNotes: e.target.value })}
            placeholder="Add any notes for this order"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Delivery Option</Label>
          <RadioGroup 
            value={values.deliveryType} 
            onValueChange={(value) => onChange({ deliveryType: value as '1' | '2' })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="delivery" />
              <Label htmlFor="delivery">Delivery</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="pickup" />
              <Label htmlFor="pickup">Pick Up</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="forceOrder" 
            checked={values.forceOrder} 
            onCheckedChange={(checked) => onChange({ forceOrder: checked as boolean })}
          />
          <Label htmlFor="forceOrder" className="text-sm">
            Force Order (bypass price and inventory checks)
          </Label>
        </div>

        {cartItems.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Order Summary</h4>
            <p className="text-sm text-muted-foreground">
              {cartItems.length} items ready for submission to EzyParts
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          className="w-full"
          onClick={handleEzyPartsOrder}
          disabled={disabled || isSubmitting || cartItems.length === 0}
        >
          <SendHorizontal className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Submitting Order...' : 'Submit Order to EzyParts'}
        </Button>
        
        <Button
          variant="outline"
          className="w-full"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back to Vehicle Search
        </Button>
      </CardFooter>
    </Card>
  );
};
