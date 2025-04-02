
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TechnicianProfileData } from "./types";
import { useAuth } from "@/contexts/AuthContext";

interface TechnicianCodeLoginFormProps {
  onLoginSuccess: () => void;
}

const TechnicianCodeLoginForm = ({ onLoginSuccess }: TechnicianCodeLoginFormProps) => {
  const [techCode, setTechCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!techCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter your technician code",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Look up the technician by their code
      const { data, error } = await supabase
        .from('user_technicians')
        .select('*')
        .eq('tech_code', techCode)
        .eq('user_id', user?.id || '')
        .single();
      
      if (error || !data) {
        throw new Error("Invalid technician code");
      }
      
      // Store technician info in local storage
      const technicianProfile: TechnicianProfileData = {
        id: data.id,
        name: data.name,
        specialty: data.specialty,
        experience: data.experience
      };
      
      localStorage.setItem('technicianProfile', JSON.stringify(technicianProfile));
      
      onLoginSuccess();
      
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Invalid technician code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="techCode"
            placeholder="Enter your technician code"
            value={techCode}
            onChange={(e) => setTechCode(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Authenticating..." : "Login"}
      </Button>
    </form>
  );
};

export default TechnicianCodeLoginForm;
