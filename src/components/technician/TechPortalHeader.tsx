
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Bell } from "lucide-react";

const TechPortalHeader = () => {
  const navigate = useNavigate();
  
  return (
    <header className="bg-black text-white py-3 px-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => navigate('/')}
          >
            <Home className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">Technician Portal</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TechPortalHeader;
