import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, AlertCircle, Package } from "lucide-react";
import { formatStockDisplay, formatPricePerUnit } from "@/utils/inventory/unitConversion";

interface InventoryImpact {
  itemId: string;
  itemName: string;
  currentStock: number;
  quantityUsed: number;
  afterStock: number;
  minStock: number;
  isBulkProduct: boolean;
  bulkQuantity?: number;
  unitOfMeasure?: string;
  pricePerUnit: number;
}

interface InvoiceConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  customerName: string;
  invoiceDate: string;
  totalAmount: number;
  inventoryImpacts: InventoryImpact[];
  isLoading?: boolean;
}

const InvoiceConfirmationDialog: React.FC<InvoiceConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  customerName,
  invoiceDate,
  totalAmount,
  inventoryImpacts,
  isLoading = false
}) => {
  const [confirmed, setConfirmed] = React.useState(false);

  const getStockStatus = (impact: InventoryImpact) => {
    if (impact.afterStock < 0) {
      return { status: 'critical', label: 'Insufficient Stock', color: 'text-destructive' };
    }
    if (impact.afterStock < impact.minStock) {
      return { status: 'low', label: 'Below Minimum', color: 'text-destructive' };
    }
    if (impact.afterStock < impact.minStock * 1.5) {
      return { status: 'warning', label: 'Approaching Minimum', color: 'text-amber-500' };
    }
    return { status: 'normal', label: 'Normal', color: 'text-green-600' };
  };

  const hasCriticalIssues = inventoryImpacts.some(impact => impact.afterStock < 0);

  const handleConfirm = () => {
    if (hasCriticalIssues) return;
    onConfirm();
  };

  React.useEffect(() => {
    if (!isOpen) {
      setConfirmed(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Invoice Creation</DialogTitle>
          <DialogDescription>
            Review the invoice details and inventory changes before proceeding
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-sm">Invoice Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Customer:</span>
                <span className="ml-2 font-medium">{customerName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>
                <span className="ml-2 font-medium">{invoiceDate}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="ml-2 font-medium text-lg">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Inventory Impact Section */}
          {inventoryImpacts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">This invoice will deduct from inventory:</h3>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/30 px-4 py-2 grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
                  <div className="col-span-3">Product</div>
                  <div className="col-span-2">Current Stock</div>
                  <div className="col-span-2">Quantity Used</div>
                  <div className="col-span-2">After Deduction</div>
                  <div className="col-span-3">Status</div>
                </div>

                <div className="divide-y">
                  {inventoryImpacts.map((impact) => {
                    const stockStatus = getStockStatus(impact);
                    const StatusIcon = 
                      stockStatus.status === 'critical' ? AlertTriangle :
                      stockStatus.status === 'low' ? AlertTriangle :
                      stockStatus.status === 'warning' ? AlertCircle :
                      CheckCircle2;

                    return (
                      <div key={impact.itemId} className="px-4 py-3 grid grid-cols-12 gap-2 items-center text-sm">
                        <div className="col-span-3">
                          <div className="font-medium">{impact.itemName}</div>
                          {impact.isBulkProduct && (
                            <Badge variant="outline" className="mt-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
                              Bulk
                            </Badge>
                          )}
                        </div>
                    <div className="col-span-2">
                      {impact.isBulkProduct && impact.bulkQuantity
                        ? formatStockDisplay(impact.currentStock, impact.bulkQuantity, impact.unitOfMeasure)
                        : `${impact.currentStock} units`
                      }
                    </div>
                    <div className="col-span-2 font-medium">
                      {impact.isBulkProduct && impact.bulkQuantity
                        ? `${impact.quantityUsed} ${impact.unitOfMeasure || 'units'}`
                        : `${impact.quantityUsed} units`
                      }
                    </div>
                    <div className="col-span-2 font-medium">
                      {impact.isBulkProduct && impact.bulkQuantity
                        ? formatStockDisplay(impact.afterStock, impact.bulkQuantity, impact.unitOfMeasure)
                        : `${impact.afterStock} units`
                      }
                    </div>
                        <div className="col-span-3">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`h-4 w-4 ${stockStatus.color}`} />
                            <span className={`text-xs font-medium ${stockStatus.color}`}>
                              {stockStatus.label}
                            </span>
                          </div>
                        {impact.afterStock < impact.minStock && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Min: {impact.isBulkProduct && impact.bulkQuantity
                              ? formatStockDisplay(impact.minStock, impact.bulkQuantity, impact.unitOfMeasure)
                              : `${impact.minStock} units`
                            }
                          </div>
                        )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {hasCriticalIssues && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Cannot Create Invoice</p>
                    <p className="text-sm text-destructive/80 mt-1">
                      One or more items have insufficient stock. Please adjust the invoice or add stock before proceeding.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Confirmation Checkbox */}
          {!hasCriticalIssues && inventoryImpacts.length > 0 && (
            <div className="flex items-center space-x-2 bg-muted/50 p-4 rounded-lg">
              <Checkbox
                id="confirm"
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked as boolean)}
              />
              <label
                htmlFor="confirm"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I confirm these inventory changes and want to create this invoice
              </label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={hasCriticalIssues || (!confirmed && inventoryImpacts.length > 0) || isLoading}
          >
            {isLoading ? "Creating..." : "Confirm & Create Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceConfirmationDialog;
