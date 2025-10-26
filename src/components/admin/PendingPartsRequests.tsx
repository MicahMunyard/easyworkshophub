import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Package, Wrench, AlertCircle } from "lucide-react";
import { useJobParts } from "@/hooks/inventory/useJobParts";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInventoryItems } from "@/hooks/inventory/useInventoryItems";

export const PendingPartsRequests = () => {
  const { user } = useAuth();
  const { parts, isLoading, approvePart, denyPart, fetchAllPendingParts } = useJobParts();
  const { inventoryItems } = useInventoryItems();
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'deny' | null>(null);
  const [denyReason, setDenyReason] = useState("");
  const [selectedInventoryId, setSelectedInventoryId] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchAllPendingParts(user.id);
    }
  }, [user]);

  const handleApprove = async () => {
    if (!selectedPart || !user) return;
    
    try {
      await approvePart(selectedPart.id, user.id, selectedInventoryId || selectedPart.inventory_item_id);
      setActionType(null);
      setSelectedPart(null);
      setSelectedInventoryId("");
    } catch (error) {
      console.error('Error approving part:', error);
    }
  };

  const handleDeny = async () => {
    if (!selectedPart || !user || !denyReason.trim()) return;
    
    try {
      await denyPart(selectedPart.id, user.id, denyReason);
      setActionType(null);
      setSelectedPart(null);
      setDenyReason("");
    } catch (error) {
      console.error('Error denying part:', error);
    }
  };

  const getStockStatus = (inventoryItemId: string | null) => {
    if (!inventoryItemId) return null;
    const item = inventoryItems.find(i => i.id === inventoryItemId);
    if (!item) return null;
    
    return {
      inStock: item.inStock,
      status: item.status
    };
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading parts requests...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <div>
              <CardTitle>Pending Parts Requests</CardTitle>
              <CardDescription>Review and approve parts requested by technicians</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {parts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending parts requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {parts.map((part) => {
                const stockStatus = getStockStatus(part.inventory_item_id);
                
                return (
                  <div
                    key={part.id}
                    className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{part.part_name}</h4>
                          {part.part_code && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {part.part_code}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Wrench className="h-3 w-3" />
                            <span>Job: {part.job?.customer} - {part.job?.vehicle}</span>
                          </div>
                          <div>Quantity: {part.quantity}</div>
                          {part.unit_cost && (
                            <div>Cost: ${part.unit_cost} × {part.quantity} = ${part.total_cost}</div>
                          )}
                        </div>
                        
                        {stockStatus && (
                          <div className="flex items-center gap-2 mt-2">
                            {stockStatus.inStock >= part.quantity ? (
                              <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                In Stock: {stockStatus.inStock}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-amber-500/10 text-amber-700">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Low Stock: {stockStatus.inStock}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setSelectedPart(part);
                            setSelectedInventoryId(part.inventory_item_id || "");
                            setActionType('approve');
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedPart(part);
                            setActionType('deny');
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Deny
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={actionType === 'approve'} onOpenChange={(open) => !open && setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Parts Request</DialogTitle>
            <DialogDescription>
              Review and link this request to an inventory item
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Part Name</Label>
              <p className="text-sm font-medium">{selectedPart?.part_name}</p>
            </div>
            
            <div>
              <Label>Quantity</Label>
              <p className="text-sm font-medium">{selectedPart?.quantity}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inventory-item">Link to Inventory Item *</Label>
              <Select value={selectedInventoryId} onValueChange={setSelectedInventoryId}>
                <SelectTrigger className={!selectedInventoryId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select inventory item (required)" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems
                    .filter(item => 
                      item.name.toLowerCase().includes(selectedPart?.part_name.toLowerCase() || '') ||
                      item.code?.toLowerCase().includes(selectedPart?.part_code?.toLowerCase() || '')
                    )
                    .map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.code}) - Stock: {item.inStock} - ${item.price}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Required for proper inventory tracking and invoice pricing
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={!selectedInventoryId}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deny Dialog */}
      <Dialog open={actionType === 'deny'} onOpenChange={(open) => !open && setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Parts Request</DialogTitle>
            <DialogDescription>
              Provide a reason for denying this parts request
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Part Name</Label>
              <p className="text-sm font-medium">{selectedPart?.part_name}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deny-reason">Reason for Denial *</Label>
              <Textarea
                id="deny-reason"
                placeholder="e.g., Part not available, incorrect specification..."
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeny}
              disabled={!denyReason.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Deny Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
