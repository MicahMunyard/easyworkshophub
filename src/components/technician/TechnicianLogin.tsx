
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TechnicianLogin = () => {
  const [techCode, setTechCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!techCode.trim()) {
      toast({
        title: "Technician code required",
        description: "Please enter your technician code.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to your account first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // For demo purposes, we'll use a simple code matching approach
      // In a real app, you might have a more secure authentication method
      const { data, error } = await supabase
        .from('user_technicians')
        .select('*')
        .eq('user_id', user.id)
        .eq('tech_code', techCode)
        .single();
      
      if (error || !data) {
        throw new Error("Invalid technician code");
      }
      
      // Successfully authenticated as technician
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.name}!`,
      });
      
      // The main component will re-render with the technician dashboard
    } catch (error) {
      console.error('Technician login error:', error);
      toast({
        title: "Login failed",
        description: "Invalid technician code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Technician Login</CardTitle>
          <CardDescription>
            Enter your technician code to access your assigned jobs
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="techCode">Technician Code</Label>
                <Input
                  id="techCode"
                  placeholder="Enter your code"
                  value={techCode}
                  onChange={(e) => setTechCode(e.target.value)}
                  className="text-lg py-6"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full text-lg py-6" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : "Access My Jobs"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default TechnicianLogin;
