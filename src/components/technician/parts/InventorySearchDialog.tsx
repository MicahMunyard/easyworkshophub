import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Package } from "lucide-react";
import { useInventoryItems } from "@/hooks/inventory/useInventoryItems";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InventorySearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectItem: (itemName: string, itemId: string) => void;
}

export const InventorySearchDialog = ({
  open,
  onOpenChange,
  onSelectItem
}: InventorySearchDialogProps) => {
  const { inventoryItems } = useInventoryItems();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search Inventory</DialogTitle>
          <DialogDescription>
            Find and select parts from your inventory
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[400px] rounded-md border">
            <div className="p-4 space-y-2">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No inventory items found</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => {
                      onSelectItem(item.name, item.id);
                      onOpenChange(false);
                      setSearchQuery("");
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{item.name}</h4>
                          {item.code && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {item.code}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Stock: {item.inStock}</span>
                          <span>${item.price}</span>
                          <span>{item.supplier}</span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          item.status === 'normal' ? 'secondary' :
                          item.status === 'low' ? 'default' : 'destructive'
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
