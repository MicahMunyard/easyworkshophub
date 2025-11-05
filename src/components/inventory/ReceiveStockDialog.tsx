import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InventoryItem } from '@/types/inventory';
import { Package, Calendar, FileText } from 'lucide-react';

interface ReceiveStockDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReceive: (itemId: string, quantity: number, price: number) => void;
}

const ReceiveStockDialog: React.FC<ReceiveStockDialogProps> = ({
  item,
  open,
  onOpenChange,
  onReceive,
}) => {
  const [quantity, setQuantity] = useState(item?.orderedQuantity || 0);
  const [price, setPrice] = useState(item?.price || 0);

  React.useEffect(() => {
    if (item) {
      setQuantity(item.orderedQuantity || 0);
      setPrice(item.price || 0);
    }
  }, [item]);

  const handleReceive = () => {
    if (item && quantity > 0) {
      onReceive(item.id, quantity, price);
      onOpenChange(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Receive Stock</DialogTitle>
          <DialogDescription>
            Confirm the quantity received for this item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-semibold">{item.name}</h4>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Order Number</p>
                <p className="text-sm font-medium">{item.ezypartsOrderNumber || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Order Date</p>
                <p className="text-sm font-medium">
                  {item.orderDate ? new Date(item.orderDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Ordered Quantity</p>
                <p className="text-sm font-medium">{item.orderedQuantity || 0}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity Received</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              placeholder="Enter received quantity"
            />
            <p className="text-xs text-muted-foreground">
              This quantity will be added to your stock
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Actual Price (from invoice)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              placeholder="Enter actual price"
            />
            <p className="text-xs text-muted-foreground">
              Original price: <span className="font-medium">${item?.price.toFixed(2)}</span>
              {price !== item?.price && (
                <span className="ml-2 text-warning">
                  (Difference: ${Math.abs(price - (item?.price || 0)).toFixed(2)})
                </span>
              )}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleReceive} disabled={quantity <= 0}>
            Receive into Stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiveStockDialog;
