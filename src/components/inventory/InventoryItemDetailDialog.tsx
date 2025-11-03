import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryItem } from '@/types/inventory';
import InventoryItemOverviewTab from './InventoryItemOverviewTab';
import TransactionHistoryTab from './TransactionHistoryTab';

interface InventoryItemDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

const InventoryItemDetailDialog: React.FC<InventoryItemDetailDialogProps> = ({
  isOpen,
  onClose,
  item
}) => {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{item.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <InventoryItemOverviewTab item={item} />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <TransactionHistoryTab itemId={item.id} itemCode={item.code} itemName={item.name} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryItemDetailDialog;
