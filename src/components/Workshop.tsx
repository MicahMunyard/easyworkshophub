
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Settings, Wrench, Search } from "lucide-react";

/**
 * Workshop page that serves as the main container for all workshop-related functionality
 */
const Workshop: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-workshop-carbon to-workshop-slate bg-clip-text text-transparent">Workshop Management</h1>
        <p className="text-muted-foreground">
          Manage your workshop settings, bookings, and jobs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stats-card group hover:scale-[1.02] transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-white mb-2 group-hover:animate-floatUp">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="font-medium text-lg">Booking Diary</h3>
              <p className="text-sm text-muted-foreground">View and manage appointments</p>
              <Button 
                onClick={() => navigate("/booking-diary")} 
                className="mt-2 w-full bg-gradient-primary hover:opacity-90"
              >
                Open Booking Diary
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card group hover:scale-[1.02] transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-white mb-2 group-hover:animate-floatUp">
                <Settings className="h-8 w-8" />
              </div>
              <h3 className="font-medium text-lg">Workshop Setup</h3>
              <p className="text-sm text-muted-foreground">Configure workshop settings</p>
              <Button 
                onClick={() => navigate("/workshop-setup")} 
                className="mt-2 w-full bg-gradient-primary hover:opacity-90"
              >
                Configure Workshop
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card group hover:scale-[1.02] transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-white mb-2 group-hover:animate-floatUp">
                <Wrench className="h-8 w-8" />
              </div>
              <h3 className="font-medium text-lg">Jobs</h3>
              <p className="text-sm text-muted-foreground">Manage ongoing and completed jobs</p>
              <Button 
                onClick={() => navigate("/jobs")} 
                className="mt-2 w-full bg-gradient-primary hover:opacity-90"
              >
                View Jobs
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card group hover:scale-[1.02] transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-white mb-2 group-hover:animate-floatUp">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="font-medium text-lg">Vehicle Search</h3>
              <p className="text-sm text-muted-foreground">Get detailed vehicle information</p>
              <Button 
                onClick={() => navigate("/vehicle-search")} 
                className="mt-2 w-full bg-gradient-primary hover:opacity-90"
              >
                Search Vehicles
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Workshop;
