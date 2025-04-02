
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Mail, User } from "lucide-react";

type TechnicianProfileData = {
  id: string;
  name: string;
  specialty: string | null;
  experience: string | null;
};

// Explicitly define the structure matching the PostgreSQL function
type LoginCheckResult = {
  is_valid: boolean;
  technician_id: string | null;
};

const TechnicianLogin = () => {
  const [techCode, setTechCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "email">("code");
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleCodeLogin = async (e: React.FormEvent) => {
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

  const handleEmailLogin = async (e: React.FormEvent) => {
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
      // Explicitly type the RPC call with LoginCheckResult
      const { data, error } = await supabase.rpc<LoginCheckResult, LoginCheckResult>('verify_technician_login', {
        tech_email: email,
        tech_password: btoa(password),
        workshop_user_id: user?.id || ''
      });
      
      // Use type guard to check the result
      if (error || !data || !data.is_valid) {
        throw new Error("Invalid email or password");
      }
      
      // Get technician details
      const { data: techData, error: techError } = await supabase
        .from('user_technicians')
        .select('*')
        .eq('id', data.technician_id)
        .eq('user_id', user?.id || '')
        .single();
      
      if (techError || !techData) {
        throw new Error("Technician not found");
      }
      
      // Track login time via RPC
      await supabase.rpc('update_technician_last_login', {
        tech_id: data.technician_id
      });
      
      // Store technician info in local storage
      const technicianProfile: TechnicianProfileData = {
        id: techData.id,
        name: techData.name,
        specialty: techData.specialty,
        experience: techData.experience
      };
      
      localStorage.setItem('technicianProfile', JSON.stringify(technicianProfile));
      
      // Refresh the page to show the technician dashboard
      window.location.reload();
      
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
    <div className="flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Technician Portal</CardTitle>
          <CardDescription>
            Access your assigned jobs and work orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "code" | "email")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="code">Access Code</TabsTrigger>
              <TabsTrigger value="email">Email Login</TabsTrigger>
            </TabsList>
            
            <TabsContent value="code">
              <form onSubmit={handleCodeLogin} className="space-y-4 pt-4">
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
            </TabsContent>
            
            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4 pt-4">
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
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground flex justify-center">
          <p>Contact your workshop manager if you need assistance with login</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TechnicianLogin;
