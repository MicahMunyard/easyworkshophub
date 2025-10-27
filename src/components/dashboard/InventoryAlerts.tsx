
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLowStockItems } from "@/hooks/dashboard/useLowStockItems";

interface InventoryAlertsProps {
  user: any;
}

const InventoryAlerts: React.FC<InventoryAlertsProps> = ({ user }) => {
  const navigate = useNavigate();
  const { data: lowStockItems, isLoading } = useLowStockItems(user?.id);
  
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
        ) : isLoading ? (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : lowStockItems && lowStockItems.length > 0 ? (
          <>
            <div className="divide-y">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-start gap-3 hover:bg-muted/40">
                  <div className="h-8 w-8 rounded-full bg-workshop-red/10 flex items-center justify-center mt-0.5">
                    <Package className="h-4 w-4 text-workshop-red" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Stock: {item.in_stock} (Min: {item.min_stock})
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 pt-2 border-t">
              <Button 
                variant="outline" 
                className="w-full hover:bg-workshop-red hover:text-white"
                onClick={() => navigate("/suppliers")}
              >
                Manage Inventory
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="p-6 text-center">
              <p className="text-muted-foreground">All items in stock</p>
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
