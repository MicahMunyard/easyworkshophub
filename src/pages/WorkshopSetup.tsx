import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, Users, Wrench, Ruler, Clock, Warehouse, Lock, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TechnicianForm from "@/components/workshop/TechnicianForm";
import ServiceForm from "@/components/workshop/ServiceForm";
import ServiceBayForm from "@/components/workshop/ServiceBayForm";
import { useAuth } from "@/contexts/AuthContext";

interface Technician {
  id: string;
  name: string;
  specialty: string | null;
  experience: string | null;
  email: string | null;
  tech_code: string | null;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface ServiceBay {
  id: string;
  name: string;
  type: string;
  equipment: string | null;
}

const WorkshopSetup: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceBays, setServiceBays] = useState<ServiceBay[]>([]);
  
  const [isAddingTechnician, setIsAddingTechnician] = useState(false);
  const [isEditingTechnician, setIsEditingTechnician] = useState<Technician | null>(null);
  
  const [isAddingService, setIsAddingService] = useState(false);
  const [isEditingService, setIsEditingService] = useState<Service | null>(null);
  
  const [isAddingBay, setIsAddingBay] = useState(false);
  const [isEditingBay, setIsEditingBay] = useState<ServiceBay | null>(null);

  const fetchTechnicians = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_technicians')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      setTechnicians(data as Technician[] || []);
    } catch (error) {
      console.error('Error fetching technicians:', error);
      toast({
        title: "Error",
        description: "Failed to load technicians",
        variant: "destructive",
      });
    }
  };
  
  const fetchServices = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_services')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    }
  };
  
  const fetchServiceBays = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_service_bays')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      setServiceBays(data || []);
    } catch (error) {
      console.error('Error fetching service bays:', error);
      toast({
        title: "Error",
        description: "Failed to load service bays",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchTechnicians();
      fetchServices();
      fetchServiceBays();
    }
  }, [user]);

  const handleAddTechnician = async (values: any) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add technicians",
          variant: "destructive"
        });
        return;
      }
      
      const { data: techData, error: techError } = await supabase
        .from('user_technicians')
        .insert([{
          name: values.name,
          specialty: values.specialty,
          experience: values.experience,
          tech_code: values.tech_code,
          email: values.createLogin ? values.email : null,
          user_id: user.id
        }])
        .select();
      
      if (techError) throw techError;
      
      if (values.createLogin && values.email && values.password) {
        const passwordHash = btoa(values.password);
        
        const { error: loginError } = await supabase.rpc('add_technician_login', {
          tech_id: techData[0].id,
          tech_email: values.email,
          tech_password: passwordHash
        });
        
        if (loginError) {
          console.error('Error adding technician login:', loginError);
          toast({
            title: "Warning",
            description: "Technician added but login credentials couldn't be created",
            variant: "destructive",
          });
        }
      }
      
      toast({
        title: "Success",
        description: "Technician added successfully",
      });
      
      setIsAddingTechnician(false);
      fetchTechnicians();
    } catch (error: any) {
      console.error('Error adding technician:', error);
      toast({
        title: "Error",
        description: "Failed to add technician",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTechnician = async (values: any) => {
    if (!isEditingTechnician || !user) return;
    
    try {
      const { error } = await supabase
        .from('user_technicians')
        .update({
          name: values.name,
          specialty: values.specialty,
          experience: values.experience,
          tech_code: values.tech_code,
          email: values.email
        })
        .eq('id', isEditingTechnician.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (values.email && values.email !== isEditingTechnician.email) {
        const { error: loginError } = await supabase.rpc('update_technician_email', {
          tech_id: isEditingTechnician.id,
          new_email: values.email
        });
        
        if (loginError) {
          console.error('Error updating technician login:', loginError);
          toast({
            title: "Warning",
            description: "Technician updated but login email couldn't be updated",
            variant: "destructive",
          });
        }
      }
      
      toast({
        title: "Success",
        description: "Technician updated successfully",
      });
      
      setIsEditingTechnician(null);
      fetchTechnicians();
    } catch (error: any) {
      console.error('Error updating technician:', error);
      toast({
        title: "Error",
        description: "Failed to update technician",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTechnician = async (id: string) => {
    if (!confirm("Are you sure you want to delete this technician?") || !user) return;
    
    try {
      const { error } = await supabase
        .from('user_technicians')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Technician removed successfully",
      });
      
      fetchTechnicians();
    } catch (error) {
      console.error('Error deleting technician:', error);
      toast({
        title: "Error",
        description: "Failed to delete technician. It may be referenced in bookings.",
        variant: "destructive",
      });
    }
  };

  const handleAddService = async (values: any) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add services",
          variant: "destructive"
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('user_services')
        .insert([{
          ...values,
          user_id: user.id
        }])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Service added successfully",
      });
      
      setIsAddingService(false);
      fetchServices();
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: "Error",
        description: "Failed to add service",
        variant: "destructive",
      });
    }
  };

  const handleUpdateService = async (values: any) => {
    if (!isEditingService || !user) return;
    
    try {
      const { error } = await supabase
        .from('user_services')
        .update(values)
        .eq('id', isEditingService.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
      
      setIsEditingService(null);
      fetchServices();
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      });
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?") || !user) return;
    
    try {
      const { error } = await supabase
        .from('user_services')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Service removed successfully",
      });
      
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "Failed to delete service. It may be referenced in bookings.",
        variant: "destructive",
      });
    }
  };

  const handleAddBay = async (values: any) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add service bays",
          variant: "destructive"
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('user_service_bays')
        .insert([{
          ...values,
          user_id: user.id
        }])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Service bay added successfully",
      });
      
      setIsAddingBay(false);
      fetchServiceBays();
    } catch (error) {
      console.error('Error adding service bay:', error);
      toast({
        title: "Error",
        description: "Failed to add service bay",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBay = async (values: any) => {
    if (!isEditingBay || !user) return;
    
    try {
      const { error } = await supabase
        .from('user_service_bays')
        .update(values)
        .eq('id', isEditingBay.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Service bay updated successfully",
      });
      
      setIsEditingBay(null);
      fetchServiceBays();
    } catch (error) {
      console.error('Error updating service bay:', error);
      toast({
        title: "Error",
        description: "Failed to update service bay",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBay = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service bay?") || !user) return;
    
    try {
      const { error } = await supabase
        .from('user_service_bays')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Service bay removed successfully",
      });
      
      fetchServiceBays();
    } catch (error) {
      console.error('Error deleting service bay:', error);
      toast({
        title: "Error",
        description: "Failed to delete service bay. It may be referenced in bookings.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Settings className="mr-2 h-7 w-7 text-workshop-red" /> 
          Workshop Setup
        </h1>
        <p className="text-muted-foreground">
          Configure your workshop settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="technicians">Technicians</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="bays">Service Bays</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workshop Information</CardTitle>
              <CardDescription>
                Basic information about your workshop.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="workshopName" className="text-sm font-medium">
                    Workshop Name
                  </label>
                  <Input
                    id="workshopName"
                    placeholder="Enter workshop name"
                    defaultValue="TOLICCS Auto Workshop"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    defaultValue="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    defaultValue="info@toliccsauto.com"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="website" className="text-sm font-medium">
                    Website
                  </label>
                  <Input
                    id="website"
                    placeholder="Enter website URL"
                    defaultValue="www.toliccsauto.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>
                Set your workshop's operating hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div key={day} className="flex items-center justify-between">
                    <div className="w-28">{day}</div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        defaultValue={day !== 'Sunday' ? "08:00" : ""}
                        className="w-32"
                        disabled={day === 'Sunday'}
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        defaultValue={day !== 'Sunday' ? "17:00" : ""}
                        className="w-32"
                        disabled={day === 'Sunday'}
                      />
                      <Button variant="ghost" size="sm" className={day === 'Sunday' ? "text-red-500" : ""}>
                        {day === 'Sunday' ? 'Closed' : 'Open'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="technicians" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-workshop-red" />
                  Technicians
                </CardTitle>
                <CardDescription>
                  Manage technicians and their specialties.
                </CardDescription>
              </div>
              <Button 
                className="bg-workshop-red hover:bg-workshop-red/90"
                onClick={() => setIsAddingTechnician(true)}
              >
                Add Technician
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {technicians.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No technicians added yet. Add your first technician to get started.
                  </div>
                ) : (
                  technicians.map((tech) => (
                    <div key={tech.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{tech.name}</div>
                        <div className="text-sm text-muted-foreground">
                          <span className="inline-flex items-center">
                            <Wrench className="h-3.5 w-3.5 mr-1" />
                            {tech.specialty || "No specialty listed"}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="inline-flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {tech.experience || "Experience not specified"}
                          </span>
                          {tech.tech_code && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="inline-flex items-center">
                                <Lock className="h-3.5 w-3.5 mr-1" />
                                Access Code: {tech.tech_code}
                              </span>
                            </>
                          )}
                          {tech.email && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="inline-flex items-center">
                                <Mail className="h-3.5 w-3.5 mr-1" />
                                {tech.email}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setIsEditingTechnician(tech)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => handleDeleteTechnician(tech.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          <Dialog open={isAddingTechnician} onOpenChange={setIsAddingTechnician}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Technician</DialogTitle>
              </DialogHeader>
              <TechnicianForm 
                onSubmit={handleAddTechnician}
                onCancel={() => setIsAddingTechnician(false)}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={!!isEditingTechnician} onOpenChange={() => setIsEditingTechnician(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Technician</DialogTitle>
              </DialogHeader>
              {isEditingTechnician && (
                <TechnicianForm 
                  technician={isEditingTechnician}
                  onSubmit={handleUpdateTechnician}
                  onCancel={() => setIsEditingTechnician(null)}
                />
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="flex items-center">
                  <Wrench className="mr-2 h-5 w-5 text-workshop-red" />
                  Services
                </CardTitle>
                <CardDescription>
                  Manage service offerings and pricing.
                </CardDescription>
              </div>
              <Button 
                className="bg-workshop-red hover:bg-workshop-red/90"
                onClick={() => setIsAddingService(true)}
              >
                Add Service
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No services added yet. Add your first service to get started.
                  </div>
                ) : (
                  services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          <span className="inline-flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {service.duration} min
                          </span>
                          <span className="mx-2">•</span>
                          <span className="font-medium">${service.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setIsEditingService(service)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          <Dialog open={isAddingService} onOpenChange={setIsAddingService}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
              </DialogHeader>
              <ServiceForm 
                onSubmit={handleAddService}
                onCancel={() => setIsAddingService(false)}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={!!isEditingService} onOpenChange={() => setIsEditingService(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Service</DialogTitle>
              </DialogHeader>
              {isEditingService && (
                <ServiceForm 
                  service={isEditingService}
                  onSubmit={handleUpdateService}
                  onCancel={() => setIsEditingService(null)}
                />
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="bays" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="flex items-center">
                  <Warehouse className="mr-2 h-5 w-5 text-workshop-red" />
                  Service Bays
                </CardTitle>
                <CardDescription>
                  Configure workshop service bays.
                </CardDescription>
              </div>
              <Button 
                className="bg-workshop-red hover:bg-workshop-red/90"
                onClick={() => setIsAddingBay(true)}
              >
                Add Bay
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceBays.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No service bays added yet. Add your first bay to get started.
                  </div>
                ) : (
                  serviceBays.map((bay) => (
                    <div key={bay.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{bay.name}</div>
                        <div className="text-sm text-muted-foreground">
                          <span className="inline-flex items-center">
                            <Ruler className="h-3.5 w-3.5 mr-1" />
                            {bay.type}
                          </span>
                          {bay.equipment && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{bay.equipment}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setIsEditingBay(bay)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => handleDeleteBay(bay.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          <Dialog open={isAddingBay} onOpenChange={setIsAddingBay}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Service Bay</DialogTitle>
              </DialogHeader>
              <ServiceBayForm 
                onSubmit={handleAddBay}
                onCancel={() => setIsAddingBay(false)}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={!!isEditingBay} onOpenChange={() => setIsEditingBay(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Service Bay</DialogTitle>
              </DialogHeader>
              {isEditingBay && (
                <ServiceBayForm 
                  bay={isEditingBay}
                  onSubmit={handleUpdateBay}
                  onCancel={() => setIsEditingBay(null)}
                />
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkshopSetup;
