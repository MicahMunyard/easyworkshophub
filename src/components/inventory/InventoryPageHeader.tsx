
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EzyPartsSettings } from '@/components/settings/EzyPartsSettings';

const InventoryPageHeader: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">
          Manage parts, supplies, suppliers and orders
        </p>
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Configure EzyParts
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>EzyParts Credentials</DialogTitle>
            <DialogDescription>
              Configure your EzyParts (Burson Auto Parts) account credentials to enable parts ordering and quotes.
            </DialogDescription>
          </DialogHeader>
          <EzyPartsSettings />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPageHeader;
