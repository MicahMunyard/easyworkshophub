
import React, { useState } from "react";
import { Plus, X, ShoppingBag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InventorySearchDialog } from "./InventorySearchDialog";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [activePartIndex, setActivePartIndex] = useState<number | null>(null);

  const handleSelectInventoryItem = (itemName: string, itemId: string) => {
    if (activePartIndex !== null) {
      onPartNameChange(activePartIndex, itemName);
    }
  };
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Parts</DialogTitle>
            <DialogDescription>
              Add parts you need for this job. Search inventory or enter manually.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {newParts.map((part, index) => (
              <div key={index} className="space-y-2">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`part-name-${index}`}>Part Name</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`part-name-${index}`}
                        value={part.name}
                        onChange={(e) => onPartNameChange(index, e.target.value)}
                        placeholder="e.g., Brake Pads"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setActivePartIndex(index);
                          setSearchOpen(true);
                        }}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="w-24 space-y-2">
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
                      onClick={() => onRemovePart(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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

      <InventorySearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelectItem={handleSelectInventoryItem}
      />
    </>
  );
};

export default PartsRequestDialog;
