
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Dashboard from "@/components/Dashboard";
import { Wrench } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to your Workshop Hub dashboard.
          </p>
        </div>
        <Link to="/technician-portal">
          <Button variant="default" className="gap-1">
            <Wrench className="h-4 w-4" />
            Technician Portal
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1">
        <Dashboard />
      </div>
    </div>
  );
};

export default Index;
