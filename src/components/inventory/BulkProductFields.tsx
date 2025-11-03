import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UnitOfMeasure } from '@/types/inventory';
import { getUnitLabel, calculateTotalConsumptionUnits, calculatePricePerConsumptionUnit } from '@/utils/inventory/unitConversion';

interface BulkProductFieldsProps {
  form: UseFormReturn<any>;
}

const BulkProductFields: React.FC<BulkProductFieldsProps> = ({ form }) => {
  const isBulkProduct = form.watch('isBulkProduct');
  const bulkQuantity = form.watch('bulkQuantity');
  const inStock = form.watch('inStock');
  const price = form.watch('price');
  const unitOfMeasure = form.watch('unitOfMeasure') as UnitOfMeasure;

  const totalConsumptionUnits = isBulkProduct && bulkQuantity 
    ? calculateTotalConsumptionUnits(inStock || 0, true, parseFloat(bulkQuantity))
    : 0;

  const pricePerConsumption = isBulkProduct && bulkQuantity && price
    ? calculatePricePerConsumptionUnit(parseFloat(price), true, parseFloat(bulkQuantity))
    : 0;

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="unitOfMeasure"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Unit of Measure</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || 'unit'}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="unit">Units</SelectItem>
                <SelectItem value="litre">Litres (L)</SelectItem>
                <SelectItem value="ml">Millilitres (ml)</SelectItem>
                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                <SelectItem value="g">Grams (g)</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              How this product is measured
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="isBulkProduct"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                This is a bulk product
              </FormLabel>
              <FormDescription>
                Check this for products sold in bulk containers (e.g., 20L drums, 60L barrels)
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {isBulkProduct && (
        <>
          <FormField
            control={form.control}
            name="bulkQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Container Size</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={`e.g., 20 for 20${getUnitLabel(unitOfMeasure, 1)} container`}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Capacity per container (e.g., 20 for a 20L drum)
                </FormDescription>
              </FormItem>
            )}
          />

          {bulkQuantity && inStock !== undefined && (
            <div className="rounded-md bg-muted p-4 space-y-2">
              <div className="text-sm font-medium">Calculated Values:</div>
              <div className="text-sm text-muted-foreground">
                Total Stock: {inStock} containers × {bulkQuantity}{getUnitLabel(unitOfMeasure, 1)} = <span className="font-semibold">{totalConsumptionUnits}{getUnitLabel(unitOfMeasure, totalConsumptionUnits)}</span>
              </div>
              {price && (
                <div className="text-sm text-muted-foreground">
                  Price: ${parseFloat(price).toFixed(2)}/container = <span className="font-semibold">${pricePerConsumption.toFixed(2)}/{getUnitLabel(unitOfMeasure, 1)}</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BulkProductFields;
