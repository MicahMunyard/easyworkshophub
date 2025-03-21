
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, Users, Wrench, Ruler, Clock, BuildingWarehouse } from "lucide-react";

const WorkshopSetup: React.FC = () => {
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
              <Button className="bg-workshop-red hover:bg-workshop-red/90">
                Add Technician
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'John Smith', specialty: 'Engine, Transmission', experience: '8 years' },
                  { name: 'Maria Garcia', specialty: 'Electrical, Diagnostics', experience: '5 years' },
                  { name: 'David Chen', specialty: 'Brakes, Suspension', experience: '3 years' },
                  { name: 'Sarah Johnson', specialty: 'General Maintenance', experience: '4 years' },
                ].map((tech, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{tech.name}</div>
                      <div className="text-sm text-muted-foreground">
                        <span className="inline-flex items-center">
                          <Wrench className="h-3.5 w-3.5 mr-1" />
                          {tech.specialty}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="inline-flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {tech.experience}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-500">Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
              <Button className="bg-workshop-red hover:bg-workshop-red/90">
                Add Service
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Oil Change', duration: '30 min', price: '$45.00' },
                  { name: 'Brake Inspection', duration: '45 min', price: '$65.00' },
                  { name: 'Tire Rotation', duration: '30 min', price: '$35.00' },
                  { name: 'Full Service', duration: '180 min', price: '$250.00' },
                  { name: 'Engine Diagnostics', duration: '60 min', price: '$85.00' },
                ].map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground">
                        <span className="inline-flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {service.duration}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="font-medium">{service.price}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-500">Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bays" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="flex items-center">
                  <BuildingWarehouse className="mr-2 h-5 w-5 text-workshop-red" />
                  Service Bays
                </CardTitle>
                <CardDescription>
                  Configure workshop service bays.
                </CardDescription>
              </div>
              <Button className="bg-workshop-red hover:bg-workshop-red/90">
                Add Bay
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Bay 1', type: 'General Maintenance', equipment: 'Lift, Oil Drain' },
                  { name: 'Bay 2', type: 'Engine Work', equipment: 'Heavy Lift, Diagnostic Tools' },
                  { name: 'Bay 3', type: 'Quick Service', equipment: 'Fast Lift, Tire Machine' },
                  { name: 'Bay 4', type: 'Alignment', equipment: 'Alignment System, Medium Lift' },
                ].map((bay, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{bay.name}</div>
                      <div className="text-sm text-muted-foreground">
                        <span className="inline-flex items-center">
                          <Ruler className="h-3.5 w-3.5 mr-1" />
                          {bay.type}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{bay.equipment}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-500">Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkshopSetup;
