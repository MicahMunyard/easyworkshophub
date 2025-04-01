
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TechnicianLogin = () => {
  const [techCode, setTechCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleLogin = async (e: React.FormEvent) => {
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
      localStorage.setItem('technicianProfile', JSON.stringify({
        id: data.id,
        name: data.name,
        specialty: data.specialty,
        experience: data.experience
      }));
      
      // Refresh the page to show the technician dashboard
      window.location.reload();
      
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
    <div className="flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Technician Portal</CardTitle>
          <CardDescription>
            Enter your technician code to access your assigned jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="techCode"
                placeholder="Enter your technician code"
                value={techCode}
                onChange={(e) => setTechCode(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicianLogin;
