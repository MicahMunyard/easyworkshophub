
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CommunicationLogFormData } from "./types";

interface AddCommunicationLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CommunicationLogFormData) => Promise<void>;
  initialData: CommunicationLogFormData;
}

const AddCommunicationLogForm: React.FC<AddCommunicationLogFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialData
}) => {
  const [formData, setFormData] = useState<CommunicationLogFormData>(initialData);

  const handleChange = (field: keyof CommunicationLogFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Communication</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comm-type" className="text-right">
              Type
            </Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleChange('type', value)}
            >
              <SelectTrigger id="comm-type" className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="direction" className="text-right">
              Direction
            </Label>
            <Select 
              value={formData.direction} 
              onValueChange={(value) => handleChange('direction', value)}
            >
              <SelectTrigger id="direction" className="col-span-3">
                <SelectValue placeholder="Select direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inbound">Inbound (received)</SelectItem>
                <SelectItem value="outbound">Outbound (sent)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {formData.type === 'phone' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration (sec)
              </Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration || ''}
                onChange={(e) => handleChange('duration', parseInt(e.target.value) || undefined)}
                className="col-span-3"
                min="0"
                step="1"
              />
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="staff" className="text-right">
              Staff Member
            </Label>
            <Input
              id="staff"
              value={formData.staff_member || ''}
              onChange={(e) => handleChange('staff_member', e.target.value)}
              className="col-span-3"
              placeholder="Enter name"
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="content" className="text-right pt-2">
              Content
            </Label>
            <Textarea
              id="content"
              value={formData.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              className="col-span-3 min-h-[100px]"
              placeholder={`${formData.type === 'phone' ? 'Call notes' : 'Message content'}...`}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Log
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCommunicationLogForm;
