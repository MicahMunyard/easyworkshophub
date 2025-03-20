
import React, { useState } from "react";
import { EmailAutomationsProps } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Plus, Check, RefreshCw, Calendar, Gift, Car, ShoppingBag } from "lucide-react";

const EmailAutomations: React.FC<EmailAutomationsProps> = ({ automations, templates, isLoading, onSave }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template_id: "",
    trigger: "service_reminder",
    status: "active",
    frequency: "once"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.template_id || !formData.trigger) return;
    
    setIsSubmitting(true);
    try {
      await onSave({
        name: formData.name,
        description: formData.description,
        template_id: formData.template_id,
        trigger: formData.trigger as any,
        status: formData.status as any,
        frequency: formData.frequency as any
      });
      
      // Reset form and close dialog
      setFormData({
        name: "",
        description: "",
        template_id: "",
        trigger: "service_reminder",
        status: "active",
        frequency: "once"
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating automation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (automationId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    console.log(`Toggling automation ${automationId} to ${newStatus}`);
    
    // Update local state
    const updatedAutomations = automations.map(automation => 
      automation.id === automationId 
        ? { ...automation, status: newStatus as any } 
        : automation
    );
    
    // This would normally call an API to update the status
  };

  const getTriggerIcon = (trigger: string) => {
    switch(trigger) {
      case 'service_reminder':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'birthday':
        return <Gift className="h-5 w-5 text-purple-500" />;
      case 'service_completed':
        return <Car className="h-5 w-5 text-green-500" />;
      case 'after_purchase':
        return <ShoppingBag className="h-5 w-5 text-amber-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTriggerLabel = (trigger: string) => {
    const labels = {
      service_reminder: "Service Reminder",
      birthday: "Birthday",
      service_completed: "Service Completed",
      after_purchase: "After Purchase",
      other: "Other Trigger"
    };
    return labels[trigger as keyof typeof labels] || trigger;
  };

  const getFrequencyLabel = (frequency?: string) => {
    const labels = {
      once: "Once",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      yearly: "Yearly"
    };
    return frequency ? (labels[frequency as keyof typeof labels] || frequency) : "N/A";
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading automations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              New Automation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Email Automation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Automation Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter automation name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter automation description"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template_id">Email Template</Label>
                <Select
                  value={formData.template_id}
                  onValueChange={(value) => handleSelectChange("template_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trigger">Trigger</Label>
                <Select
                  value={formData.trigger}
                  onValueChange={(value) => handleSelectChange("trigger", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service_reminder">Service Reminder</SelectItem>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="service_completed">Service Completed</SelectItem>
                    <SelectItem value="after_purchase">After Purchase</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => handleSelectChange("frequency", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.status === "active"}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, status: checked ? "active" : "inactive" })
                  }
                  id="active-status"
                />
                <Label htmlFor="active-status">Enable automation</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !formData.name ||
                    !formData.template_id ||
                    !formData.trigger
                  }
                >
                  {isSubmitting ? "Creating..." : "Create Automation"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {automations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No automations available. Create your first automation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automations.map((automation) => (
            <Card key={automation.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {getTriggerIcon(automation.trigger)}
                      {automation.name}
                    </CardTitle>
                    <CardDescription>{automation.description}</CardDescription>
                  </div>
                  <Switch
                    checked={automation.status === "active"}
                    onCheckedChange={() => handleToggleStatus(automation.id, automation.status)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Trigger:</span>
                    <span className="font-medium">{getTriggerLabel(automation.trigger)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-medium">{getFrequencyLabel(automation.frequency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Template:</span>
                    <span className="font-medium">
                      {templates.find(t => t.id === automation.template_id)?.name || "Unknown Template"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium ${automation.status === "active" ? "text-green-500" : "text-muted-foreground"}`}>
                      {automation.status === "active" ? (
                        <span className="flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        "Inactive"
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailAutomations;
