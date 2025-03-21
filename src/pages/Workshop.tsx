
import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Settings, Calendar, Wrench } from "lucide-react";

/**
 * Workshop page that serves as the main container for all workshop-related functionality
 */
const Workshop: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workshop Management</h1>
        <p className="text-muted-foreground">
          Manage your workshop settings, bookings, and jobs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <Calendar className="h-12 w-12 text-workshop-red mb-2" />
              <h3 className="font-medium text-lg">Booking Diary</h3>
              <p className="text-sm text-muted-foreground">View and manage appointments</p>
              <Button asChild className="mt-4 w-full">
                <Link to="/booking-diary">Open Booking Diary</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <Settings className="h-12 w-12 text-workshop-red mb-2" />
              <h3 className="font-medium text-lg">Workshop Setup</h3>
              <p className="text-sm text-muted-foreground">Configure workshop settings</p>
              <Button asChild className="mt-4 w-full">
                <Link to="/workshop-setup">Configure Workshop</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <Wrench className="h-12 w-12 text-workshop-red mb-2" />
              <h3 className="font-medium text-lg">Jobs</h3>
              <p className="text-sm text-muted-foreground">Manage ongoing and completed jobs</p>
              <Button asChild className="mt-4 w-full">
                <Link to="/jobs">View Jobs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Workshop;
