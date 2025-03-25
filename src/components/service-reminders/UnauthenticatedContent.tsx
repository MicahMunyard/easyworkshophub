
import React from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UnauthenticatedContent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="border rounded-md p-4 text-center">
      <p className="text-sm text-muted-foreground mb-3">
        Sign in to view and manage service reminders
      </p>
      <Button 
        variant="default" 
        size="sm" 
        onClick={() => navigate("/auth/signin")}
        className="w-full"
      >
        <LogIn className="h-4 w-4 mr-2" /> Sign In
      </Button>
    </div>
  );
};

export default UnauthenticatedContent;
