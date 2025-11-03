import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Package } from 'lucide-react';
import { InventoryItem } from '@/types/inventory';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import { 
  formatStockDisplay, 
  calculatePricePerConsumptionUnit, 
  calculateTotalConsumptionUnits,
  validateSufficientStock,
  getUnitLabel 
} from '@/utils/inventory/unitConversion';

interface InventoryItemSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: InventoryItem, quantity: number, unitPrice: number) => void;
}

const InventoryItemSelector: React.FC<InventoryItemSelectorProps> = ({ open, onClose, onSelect }) => {
  const { inventoryItems } = useInventoryItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState<string>('1');

  const filteredItems = inventoryItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setQuantity('1');
  };

  const handleAddToInvoice = () => {
    if (!selectedItem) return;

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    // Validate stock
    const validation = validateSufficientStock(
      qty,
      selectedItem.inStock,
      selectedItem.isBulkProduct || false,
      selectedItem.bulkQuantity
    );

    if (!validation.isValid) {
      const proceed = window.confirm(
        `${validation.message}\n\nDo you want to continue anyway?`
      );
      if (!proceed) return;
    }

    // Calculate the unit price in consumption units
    const unitPrice = calculatePricePerConsumptionUnit(
      selectedItem.price,
      selectedItem.isBulkProduct || false,
      selectedItem.bulkQuantity
    );

    onSelect(selectedItem, qty, unitPrice);
    setSelectedItem(null);
    setSearchQuery('');
    setQuantity('1');
    onClose();
  };

  const renderItemDetails = (item: InventoryItem) => {
    const availableStock = calculateTotalConsumptionUnits(
      item.inStock,
      item.isBulkProduct || false,
      item.bulkQuantity
    );

    const pricePerUnit = calculatePricePerConsumptionUnit(
      item.price,
      item.isBulkProduct || false,
      item.bulkQuantity
    );

    const unitLabel = getUnitLabel(item.unitOfMeasure || 'unit', 1);

    return (
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">{item.code}</p>
          </div>
          {item.isBulkProduct && (
            <Badge variant="secondary" className="ml-2">Bulk</Badge>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Available:</span>
            <span className="ml-2 font-medium">
              {formatStockDisplay(item.inStock, item.bulkQuantity, item.unitOfMeasure)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Price:</span>
            <span className="ml-2 font-medium">
              ${pricePerUnit.toFixed(2)}/{unitLabel}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add from Inventory</DialogTitle>
          <DialogDescription>
            Search and select an item from your inventory to add to the invoice
          </DialogDescription>
        </DialogHeader>

        {!selectedItem ? (
          <div className="flex-1 flex flex-col space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, code, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex-1 overflow-auto space-y-2 border rounded-md p-4">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No items found</p>
                </div>
              ) : (
                filteredItems.map(item => (
                  <div
                    key={item.id}
                    className="p-3 border rounded-md hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleItemClick(item)}
                  >
                    {renderItemDetails(item)}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-muted/50">
              {renderItemDetails(selectedItem)}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity to Invoice ({getUnitLabel(selectedItem.unitOfMeasure || 'unit', parseFloat(quantity) || 1)})
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
              {parseFloat(quantity) > 0 && (
                <p className="text-sm text-muted-foreground">
                  Total: ${(parseFloat(quantity) * calculatePricePerConsumptionUnit(
                    selectedItem.price,
                    selectedItem.isBulkProduct || false,
                    selectedItem.bulkQuantity
                  )).toFixed(2)}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedItem(null)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleAddToInvoice}
                className="flex-1"
              >
                Add to Invoice
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InventoryItemSelector;
