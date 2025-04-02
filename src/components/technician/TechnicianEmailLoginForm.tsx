
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TechnicianProfileData } from "./types";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";

interface TechnicianEmailLoginFormProps {
  onLoginSuccess: () => void;
}

interface VerifyTechnicianLoginParams {
  tech_email: string;
  tech_password: string;
  workshop_user_id: string;
}

interface VerifyLoginResult {
  is_valid: boolean;
  technician_id: string | null;
}

const TechnicianEmailLoginForm = ({ onLoginSuccess }: TechnicianEmailLoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error("You must be logged in to access technician features");
      }

      // Verify technician credentials using RPC function
      const { data, error } = await supabase.rpc(
        'verify_technician_login',
        { 
          tech_email: email, 
          tech_password: password, 
          workshop_user_id: user.id 
        }
      );
      
      // Cast the data to the expected type
      const result = data as VerifyLoginResult;
      
      if (error || !result || !result.is_valid) {
        throw new Error("Invalid email or password");
      }
      
      // Successfully authenticated
      const technicianId = result.technician_id;
      
      if (!technicianId) {
        throw new Error("Technician ID not found");
      }
      
      // Fetch technician details
      const { data: techDetails, error: techError } = await supabase
        .from('user_technicians')
        .select('id, name, specialty, experience')
        .eq('id', technicianId)
        .single();
      
      if (techError || !techDetails) {
        throw new Error("Could not retrieve technician details");
      }
      
      // Update last login timestamp
      await supabase.rpc('update_technician_last_login', { tech_id: technicianId });
      
      // Store technician info in local storage
      const technicianProfile: TechnicianProfileData = {
        id: techDetails.id,
        name: techDetails.name,
        specialty: techDetails.specialty,
        experience: techDetails.experience
      };
      
      localStorage.setItem('technicianProfile', JSON.stringify(technicianProfile));
      
      toast({
        title: "Welcome back",
        description: `Logged in successfully as ${techDetails.name}`,
      });
      
      onLoginSuccess();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      toast({
        title: "Login Failed",
        description: errorMessage,
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
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

export default TechnicianEmailLoginForm;
