
import React from "react";
import Dashboard from "@/components/Dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-6 max-w-md mx-auto text-center px-4">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Toliccs Workshop Manager</h1>
        <p className="text-muted-foreground">
          Sign in or create an account to manage your workshop operations, track jobs, schedule appointments, and more.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button 
            size="lg" 
            onClick={() => navigate('/auth/signin')}
            className="w-full sm:w-auto"
          >
            <LogIn className="mr-2 h-4 w-4" /> Sign In
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate('/auth/signup')}
            className="w-full sm:w-auto"
          >
            <UserPlus className="mr-2 h-4 w-4" /> Create Account
          </Button>
        </div>
      </div>
    );
  }

  return <Dashboard />;
};

export default Index;
