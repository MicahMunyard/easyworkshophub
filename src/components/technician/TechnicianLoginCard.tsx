
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TechnicianCodeLoginForm from "./TechnicianCodeLoginForm";
import TechnicianEmailLoginForm from "./TechnicianEmailLoginForm";

const TechnicianLoginCard = () => {
  const [activeTab, setActiveTab] = useState<"code" | "email">("code");

  const handleLoginSuccess = () => {
    // Refresh the page to show the technician dashboard
    window.location.reload();
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
              <TechnicianCodeLoginForm onLoginSuccess={handleLoginSuccess} />
            </TabsContent>
            
            <TabsContent value="email">
              <TechnicianEmailLoginForm onLoginSuccess={handleLoginSuccess} />
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

export default TechnicianLoginCard;
