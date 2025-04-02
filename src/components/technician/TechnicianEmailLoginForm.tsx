
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TechnicianProfileData } from "./types";
import { useAuth } from "@/contexts/AuthContext";

// Explicitly define the structure matching the PostgreSQL function
type LoginCheckResult = {
  is_valid: boolean;
  technician_id: string | null;
};

interface TechnicianEmailLoginFormProps {
  onLoginSuccess: () => void;
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
        description: "Please enter your email and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the RPC function with proper type annotations
      const { data, error } = await supabase.rpc('verify_technician_login', {
        tech_email: email,
        tech_password: btoa(password),
        workshop_user_id: user?.id || ''
      });
      
      // Cast the data to the expected type since the RPC returns json
      const result = data as LoginCheckResult;
      
      // Check if login is valid
      if (error || !result || !result.is_valid || !result.technician_id) {
        throw new Error("Invalid email or password");
      }
      
      // Get technician details
      const { data: techData, error: techError } = await supabase
        .from('user_technicians')
        .select('*')
        .eq('id', result.technician_id)
        .eq('user_id', user?.id || '')
        .single();
      
      if (techError || !techData) {
        throw new Error("Technician not found");
      }
      
      // Track login time via RPC
      await supabase.rpc('update_technician_last_login', {
        tech_id: result.technician_id
      });
      
      // Store technician info in local storage
      const technicianProfile: TechnicianProfileData = {
        id: techData.id,
        name: techData.name,
        specialty: techData.specialty,
        experience: techData.experience
      };
      
      localStorage.setItem('technicianProfile', JSON.stringify(technicianProfile));
      
      onLoginSuccess();
      
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-3">
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
        {isLoading ? "Authenticating..." : "Login with Email"}
      </Button>
    </form>
  );
};

export default TechnicianEmailLoginForm;
