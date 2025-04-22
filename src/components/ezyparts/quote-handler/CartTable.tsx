
import React from 'react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, MinusCircle } from 'lucide-react';
import { CartItem } from './types';
import { formatCurrency } from './utils';

interface CartTableProps {
  items: CartItem[];
  onToggleSelection: (index: number) => void;
  onUpdateQuantity: (index: number, newQty: number) => void;
}

export const CartTable: React.FC<CartTableProps> = ({
  items,
  onToggleSelection,
  onUpdateQuantity,
}) => {
  if (items.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center py-4">
          No parts selected
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Select</TableHead>
          <TableHead>Part</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead className="text-right">Price (ex. GST)</TableHead>
          <TableHead className="w-[100px] text-center">Quantity</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={item.sku} className={!item.isSelected ? 'opacity-60 bg-gray-50' : ''}>
            <TableCell>
              <Checkbox 
                checked={item.isSelected} 
                onCheckedChange={() => onToggleSelection(index)}
              />
            </TableCell>
            <TableCell>
              <div className="font-medium truncate max-w-[200px]" title={item.partDescription}>
                {item.partDescription}
              </div>
              <div className="text-sm text-gray-500">{item.sku}</div>
              {item.hasOwnProperty('isAvailable') && (
                <Badge 
                  variant={item.isAvailable ? "default" : "destructive"}
                  className="mt-1"
                >
                  {item.isAvailable 
                    ? `In Stock (${item.availableQty})` 
                    : `Limited Stock (${item.availableQty})`}
                </Badge>
              )}
            </TableCell>
            <TableCell>{item.brand}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.nettPriceEach)}
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-r-none"
                  onClick={() => onUpdateQuantity(index, item.qty - 1)}
                  disabled={!item.isSelected || item.qty <= 1}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={item.qty}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      onUpdateQuantity(index, value);
                    }
                  }}
                  className="h-8 w-12 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  disabled={!item.isSelected}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-l-none"
                  onClick={() => onUpdateQuantity(index, item.qty + 1)}
                  disabled={!item.isSelected}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.nettPriceEach * item.qty)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

