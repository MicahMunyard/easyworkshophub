import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Facebook } from "lucide-react";

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

interface FacebookPageSelectorProps {
  isOpen: boolean;
  pages: FacebookPage[];
  selectedPages: string[];
  onPageToggle: (pageId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const FacebookPageSelector: React.FC<FacebookPageSelectorProps> = ({
  isOpen,
  pages,
  selectedPages,
  onPageToggle,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const handleConfirm = () => {
    if (selectedPages.length > 0) {
      console.log('📤 Confirming page selection:', selectedPages);
      onConfirm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5 text-blue-600" />
            Select Facebook Pages to Connect
          </DialogTitle>
          <DialogDescription>
            Choose which Facebook Pages you want to connect to WorkshopBase for messaging.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-3">
            {pages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No Facebook Pages found. Make sure you manage at least one Facebook Page.
              </p>
            ) : (
              pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent transition-colors"
                >
                  <Checkbox
                    id={page.id}
                    checked={selectedPages.includes(page.id)}
                    onCheckedChange={() => onPageToggle(page.id)}
                  />
                  <label
                    htmlFor={page.id}
                    className="flex-1 text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {page.name}
                  </label>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={selectedPages.length === 0 || isLoading}
          >
            {isLoading ? "Connecting..." : `Connect ${selectedPages.length} Page${selectedPages.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FacebookPageSelector;
