import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Dashboard from "@/components/Dashboard";
import AIChatAnalytics from "@/components/ai/AIChatAnalytics";
import { Wrench } from "lucide-react";
const Index = () => {
  const {
    user
  } = useAuth();
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-workshop-carbon to-workshop-slate bg-clip-text text-transparent">Dashboard</h2>
          <p className="text-muted-foreground">Welcome to your WorkshopBase dashboard.</p>
        </div>
        <Link to="/technician-portal">
          <Button variant="default" className="gap-1 bg-gradient-primary hover:opacity-90">
            <Wrench className="h-4 w-4" />
            Technician Portal
          </Button>
        </Link>
      </div>
      
      <Dashboard />
    </div>;
};
export default Index;