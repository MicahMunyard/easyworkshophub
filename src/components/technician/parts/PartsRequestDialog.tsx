
import React from "react";
import { Plus, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PartsRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newParts: { name: string; quantity: number }[];
  onAddPart: () => void;
  onRemovePart: (index: number) => void;
  onPartNameChange: (index: number, name: string) => void;
  onPartQuantityChange: (index: number, quantity: string) => void;
  onRequestParts: () => void;
}

const PartsRequestDialog: React.FC<PartsRequestDialogProps> = ({
  isOpen,
  onOpenChange,
  newParts,
  onAddPart,
  onRemovePart,
  onPartNameChange,
  onPartQuantityChange,
  onRequestParts
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Parts</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {newParts.map((part, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                <Label htmlFor={`part-name-${index}`}>Part Name</Label>
                <Input
                  id={`part-name-${index}`}
                  value={part.name}
                  onChange={(e) => onPartNameChange(index, e.target.value)}
                  placeholder="Enter part name"
                />
              </div>
              <div className="w-20">
                <Label htmlFor={`part-qty-${index}`}>Qty</Label>
                <Input
                  id={`part-qty-${index}`}
                  type="number"
                  min="1"
                  value={part.quantity}
                  onChange={(e) => onPartQuantityChange(index, e.target.value)}
                />
              </div>
              {newParts.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-6"
                  onClick={() => onRemovePart(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button
            variant="outline"
            className="w-full gap-1"
            onClick={onAddPart}
          >
            <Plus className="h-4 w-4" />
            Add Another Part
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onRequestParts} className="gap-1">
            <ShoppingBag className="h-4 w-4" />
            Request Parts
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PartsRequestDialog;
