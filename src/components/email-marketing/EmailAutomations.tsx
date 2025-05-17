import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, Mail, Plus, RotateCw, Calendar as CalendarIcon2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { EmailTemplate, EmailAutomation, EmailAutomationProps } from "./types";
import { useToast } from "@/hooks/use-toast";

const EmailAutomations: React.FC<EmailAutomationProps> = ({ 
  automations, 
  templates, 
  isLoading, 
  onSave 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState<"event" | "schedule">("schedule");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "custom">("weekly");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const resetForm = () => {
    setName("");
    setDescription("");
    setTriggerType("schedule");
    setSelectedEvent("");
    setSelectedTemplate("");
    setFrequency("weekly");
    setDate(new Date());
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name || !selectedTemplate) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newAutomation: Omit<EmailAutomation, "id" | "created_at"> = {
        name,
        description,
        trigger_type: triggerType as EmailAutomation["trigger_type"],
        trigger_details: {
          event: triggerType === "event" ? selectedEvent : undefined,
          schedule: triggerType === "schedule" ? frequency : undefined,
        },
        template_id: selectedTemplate,
        status: "draft",
        frequency: frequency,
        next_run: date ? date.toISOString() : undefined,
        is_active: false,
        audience_type: "all",
        segment_ids: []
      };

      const success = await onSave(newAutomation);
      if (success) {
        setIsDialogOpen(false);
        resetForm();
        toast({
          title: "Automation created",
          description: "Your email automation has been created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to create automation",
        description: "There was an error creating your automation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "paused":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "draft":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatNextRunDate = (date: string | undefined) => {
    if (!date) return "Not scheduled";
    
    try {
      return format(new Date(date), "PPP");
    } catch (e) {
      return "Invalid date";
    }
  };

  // Event types (for demonstration purposes)
  const eventTypes = [
    { id: "new-customer", label: "New Customer Added" },
    { id: "service-due", label: "Service Due" },
    { id: "booking-confirmation", label: "Booking Confirmation" },
    { id: "post-service", label: "Post-Service Follow-up" },
    { id: "birthday", label: "Customer Birthday" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Email Automations</h2>
          <p className="text-sm text-muted-foreground">
            Set up recurring emails and event-triggered messages
          </p>
        </div>
        <Button 
          onClick={handleOpenDialog}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Automation
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-3"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {automations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto bg-muted rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-2">No automations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first email automation to start sending recurring or triggered emails
                </p>
                <Button onClick={handleOpenDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Automation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {automations.map((automation) => (
                <Card key={automation.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{automation.name}</CardTitle>
                        <CardDescription>
                          {automation.description || 'No description'}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(automation.status)}>
                        {automation.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Trigger Type</p>
                          <p className="text-sm text-muted-foreground">
                            {automation.trigger_type === "event" ? (
                              <span className="flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5" />
                                {automation.trigger_details.event || "Custom Event"}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <CalendarIcon2 className="h-3.5 w-3.5" />
                                {automation.frequency || "Custom Schedule"}
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Template</p>
                          <p className="text-sm text-muted-foreground">
                            {templates.find(t => t.id === automation.template_id)?.name || 'Unknown template'}
                          </p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Created</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(automation.created_at), "PPP")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Next Run</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNextRunDate(automation.next_run)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button 
                      variant={automation.status === 'active' ? "destructive" : "default"} 
                      size="sm"
                    >
                      {automation.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Email Automation</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Automation Name*</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Monthly Newsletter" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Brief description of this automation..."
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Trigger Type*</Label>
              <RadioGroup value={triggerType} onValueChange={(value) => setTriggerType(value as "event" | "schedule")} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="schedule" id="schedule" />
                  <Label htmlFor="schedule" className="cursor-pointer">Schedule-based (recurring)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="event" id="event" />
                  <Label htmlFor="event" className="cursor-pointer">Event-triggered</Label>
                </div>
              </RadioGroup>
            </div>
            
            {triggerType === "schedule" ? (
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency*</Label>
                <Select value={frequency} onValueChange={(value) => setFrequency(value as any)}>
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="pt-2">
                  <Label>First Run Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-1"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="event">Trigger Event*</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger id="event">
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="template">Email Template*</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Select a template" />
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
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Automation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailAutomations;
