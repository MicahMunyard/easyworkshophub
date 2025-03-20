
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bell, 
  CalendarIcon, 
  Car, 
  PlusCircle, 
  Wrench,
  Trash2,
  Mail,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface ServiceReminder {
  id: string;
  vehicle_info: string;
  service_type: string;
  due_date: string;
  status: 'pending' | 'sent' | 'completed' | 'cancelled';
  notification_method: string[];
  created_at: string;
  last_sent_at?: string;
  reminder_text?: string;
}

interface ServiceRemindersProps {
  customerId: number;
  customerVehicles?: string[];
}

const ServiceReminders: React.FC<ServiceRemindersProps> = ({ customerId, customerVehicles = [] }) => {
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('');
  const [reminderText, setReminderText] = useState<string>('');
  const [notificationMethods, setNotificationMethods] = useState<string[]>(['email']);
  const { toast } = useToast();

  const commonServiceTypes = [
    "Oil Change",
    "Tire Rotation",
    "Brake Inspection",
    "Annual Service",
    "MOT",
    "Air Filter Replacement",
    "Spark Plug Replacement"
  ];

  useEffect(() => {
    fetchReminders();
    if (customerVehicles.length > 0) {
      setSelectedVehicle(customerVehicles[0]);
    }
  }, [customerId, customerVehicles]);

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_reminders')
        .select('*')
        .eq('customer_id', customerId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error: any) {
      console.error("Error fetching service reminders:", error.message);
      toast({
        variant: "destructive",
        title: "Error fetching reminders",
        description: error.message,
      });
    }
  };

  const addReminder = async () => {
    if (!selectedVehicle.trim() || !serviceType.trim() || !selectedDate) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('service_reminders')
        .insert({
          customer_id: customerId,
          vehicle_info: selectedVehicle.trim(),
          service_type: serviceType.trim(),
          due_date: format(selectedDate, 'yyyy-MM-dd'),
          notification_method: notificationMethods,
          reminder_text: reminderText.trim() || null
        });

      if (error) throw error;

      resetForm();
      fetchReminders();
      
      toast({
        title: "Reminder added",
        description: "Service reminder has been added successfully",
      });
    } catch (error: any) {
      console.error("Error adding service reminder:", error.message);
      toast({
        variant: "destructive",
        title: "Error adding reminder",
        description: error.message,
      });
    }
  };

  const deleteReminder = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('service_reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;

      fetchReminders();
      
      toast({
        title: "Reminder deleted",
        description: "Service reminder has been deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting service reminder:", error.message);
      toast({
        variant: "destructive",
        title: "Error deleting reminder",
        description: error.message,
      });
    }
  };

  const updateReminderStatus = async (reminderId: string, status: 'pending' | 'sent' | 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('service_reminders')
        .update({ 
          status,
          ...(status === 'sent' ? { last_sent_at: new Date().toISOString() } : {})
        })
        .eq('id', reminderId);

      if (error) throw error;

      fetchReminders();
      
      toast({
        title: "Status updated",
        description: `Reminder status updated to ${status}`,
      });
    } catch (error: any) {
      console.error("Error updating reminder status:", error.message);
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: error.message,
      });
    }
  };

  const resetForm = () => {
    setSelectedVehicle(customerVehicles.length > 0 ? customerVehicles[0] : '');
    setServiceType('');
    setReminderText('');
    setSelectedDate(new Date());
    setNotificationMethods(['email']);
    setIsAddingReminder(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Sent</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium">Service Reminders</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAddingReminder(true)}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Reminder</span>
        </Button>
      </div>

      {reminders.length > 0 ? (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <Card key={reminder.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="bg-muted rounded-full p-2">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div>
                        <strong className="text-sm">{reminder.service_type}</strong>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          <span>Due: {format(new Date(reminder.due_date), "PPP")}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(reminder.status)}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        onClick={() => deleteReminder(reminder.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete reminder</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{reminder.vehicle_info}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Notify via:</span>
                    <div className="flex gap-1">
                      {reminder.notification_method.includes('email') && (
                        <Badge variant="secondary" className="text-xs py-0 h-5">
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Badge>
                      )}
                      {reminder.notification_method.includes('sms') && (
                        <Badge variant="secondary" className="text-xs py-0 h-5">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          SMS
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {reminder.reminder_text && (
                    <div className="text-sm border-t pt-2 mt-1">
                      {reminder.reminder_text}
                    </div>
                  )}
                  
                  {reminder.status === 'pending' && (
                    <div className="flex items-center gap-2 mt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => updateReminderStatus(reminder.id, 'sent')}
                      >
                        Mark as Sent
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => updateReminderStatus(reminder.id, 'completed')}
                      >
                        Mark Completed
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => updateReminderStatus(reminder.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          No service reminders for this customer
        </div>
      )}

      {/* Add Service Reminder Dialog */}
      <Dialog open={isAddingReminder} onOpenChange={setIsAddingReminder}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Service Reminder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vehicle-info" className="text-right">
                Vehicle
              </Label>
              {customerVehicles.length > 0 ? (
                <Select 
                  value={selectedVehicle} 
                  onValueChange={setSelectedVehicle}
                >
                  <SelectTrigger id="vehicle-info" className="col-span-3">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerVehicles.map((vehicle, index) => (
                      <SelectItem key={index} value={vehicle}>
                        {vehicle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="vehicle-info"
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter vehicle information"
                />
              )}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="service-type" className="text-right">
                Service
              </Label>
              <div className="col-span-3">
                <Select 
                  value={serviceType} 
                  onValueChange={setServiceType}
                >
                  <SelectTrigger id="service-type">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonServiceTypes.map((type, index) => (
                      <SelectItem key={index} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Service</SelectItem>
                  </SelectContent>
                </Select>
                
                {serviceType === 'custom' && (
                  <Input
                    className="mt-2"
                    value={serviceType === 'custom' ? '' : serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    placeholder="Enter custom service type"
                  />
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="due-date" className="text-right">
                Due Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="due-date"
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-0">
                Notification Method
              </Label>
              <div className="flex flex-col gap-2 col-span-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="notify-email" 
                    checked={notificationMethods.includes('email')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setNotificationMethods([...notificationMethods, 'email']);
                      } else {
                        setNotificationMethods(notificationMethods.filter(m => m !== 'email'));
                      }
                    }}
                  />
                  <Label htmlFor="notify-email" className="font-normal">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="notify-sms" 
                    checked={notificationMethods.includes('sms')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setNotificationMethods([...notificationMethods, 'sms']);
                      } else {
                        setNotificationMethods(notificationMethods.filter(m => m !== 'sms'));
                      }
                    }}
                  />
                  <Label htmlFor="notify-sms" className="font-normal">SMS</Label>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="reminder-text" className="text-right pt-2">
                Reminder Text
              </Label>
              <Textarea
                id="reminder-text"
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
                className="col-span-3 min-h-[100px]"
                placeholder="Optional: Add custom text for this reminder..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={addReminder}>
              Save Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceReminders;
