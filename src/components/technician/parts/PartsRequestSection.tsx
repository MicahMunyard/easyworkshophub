
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PartRequest } from "@/types/technician";
import PartsRequestDialog from "./PartsRequestDialog";
import PartRequestItem from "./PartRequestItem";

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
                <PartRequestItem key={part.id} part={part} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <PartsRequestDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        newParts={newParts}
        onAddPart={handleAddPart}
        onRemovePart={handleRemovePart}
        onPartNameChange={handlePartNameChange}
        onPartQuantityChange={handlePartQuantityChange}
        onRequestParts={handleRequestParts}
      />
    </>
  );
};

export default PartsRequestSection;
