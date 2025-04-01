
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingBag, Check, Clock, X, Truck } from "lucide-react";
import { PartRequest } from "@/types/technician";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface PartsRequestSectionProps {
  jobId: string;
  parts: PartRequest[];
  onRequestParts: (jobId: string, parts: { name: string, quantity: number }[]) => void;
}

const PartsRequestSection: React.FC<PartsRequestSectionProps> = ({
  jobId,
  parts,
  onRequestParts
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newParts, setNewParts] = useState<{ name: string, quantity: number }[]>([
    { name: '', quantity: 1 }
  ]);
  
  const handleAddPart = () => {
    setNewParts([...newParts, { name: '', quantity: 1 }]);
  };
  
  const handleRemovePart = (index: number) => {
    setNewParts(newParts.filter((_, i) => i !== index));
  };
  
  const handlePartNameChange = (index: number, name: string) => {
    const updated = [...newParts];
    updated[index].name = name;
    setNewParts(updated);
  };
  
  const handlePartQuantityChange = (index: number, quantity: string) => {
    const updated = [...newParts];
    updated[index].quantity = parseInt(quantity) || 1;
    setNewParts(updated);
  };
  
  const handleRequestParts = () => {
    // Filter out empty part names
    const validParts = newParts.filter(part => part.name.trim() !== '');
    
    if (validParts.length === 0) {
      return;
    }
    
    onRequestParts(jobId, validParts);
    setIsDialogOpen(false);
    setNewParts([{ name: '', quantity: 1 }]);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 flex items-center gap-1">
            <X className="h-3 w-3" />
            Denied
          </Badge>
        );
      case 'delivered':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Truck className="h-3 w-3" />
            Delivered
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Parts Requests</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Request Parts
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {parts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No parts requested for this job
            </div>
          ) : (
            <div className="space-y-4">
              {parts.map(part => (
                <div key={part.id} className="border rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{part.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {part.quantity}
                      </p>
                    </div>
                    {getStatusBadge(part.status)}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Requested {new Date(part.requested_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Request Parts Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                    onChange={(e) => handlePartNameChange(index, e.target.value)}
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
                    onChange={(e) => handlePartQuantityChange(index, e.target.value)}
                  />
                </div>
                {newParts.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-6"
                    onClick={() => handleRemovePart(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button
              variant="outline"
              className="w-full gap-1"
              onClick={handleAddPart}
            >
              <Plus className="h-4 w-4" />
              Add Another Part
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestParts} className="gap-1">
              <ShoppingBag className="h-4 w-4" />
              Request Parts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PartsRequestSection;
