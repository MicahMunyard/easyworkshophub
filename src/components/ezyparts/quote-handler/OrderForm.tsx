
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SendHorizontal } from 'lucide-react';
import { OrderFormValues } from './types';

interface OrderFormProps {
  values: OrderFormValues;
  onChange: (values: Partial<OrderFormValues>) => void;
  onSubmit: () => void;
  onBack: () => void;
  disabled: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  values,
  onChange,
  onSubmit,
  onBack,
  disabled
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
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
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          className="w-full"
          onClick={onSubmit}
          disabled={disabled}
        >
          <SendHorizontal className="mr-2 h-4 w-4" />
          Submit Order
        </Button>
        
        <Button
          variant="outline"
          className="w-full"
          onClick={onBack}
        >
          Back to Vehicle Search
        </Button>
      </CardFooter>
    </Card>
  );
};

