
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface InventoryAlertsProps {
  user: any;
}

const InventoryAlerts: React.FC<InventoryAlertsProps> = ({ user }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="col-span-12 md:col-span-4 performance-card">
      <CardHeader className="p-4 pb-2 border-b border-border/50">
        <CardTitle className="flex items-center">
          <AlertCircle className="mr-2 h-5 w-5 text-workshop-red" />
          Inventory Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {!user ? (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">Sign in to view inventory alerts</p>
          </div>
        ) : (
          <>
            <div className="p-6 text-center">
              <p className="text-muted-foreground">No inventory alerts</p>
            </div>
            <div className="p-4 pt-2">
              <Button 
                variant="outline" 
                className="w-full hover:bg-workshop-red hover:text-white"
                onClick={() => navigate("/suppliers")}
              >
                Manage Inventory
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryAlerts;
