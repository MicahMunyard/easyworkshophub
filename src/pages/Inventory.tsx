
import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  PackageOpen,
  ShoppingCart,
  TrendingDown,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  MoreHorizontal,
  BarChart2,
  Truck,
  FileText
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SupplierManagement from "@/components/inventory/SupplierManagement";
import ProductCatalog from "@/components/inventory/ProductCatalog";
import OrderForm from "@/components/inventory/OrderForm";
import OrderHistory from "@/components/inventory/OrderHistory";
import AddBrakeCleanerProduct from "@/components/inventory/AddBrakeCleanerProduct";
import { useSuppliers } from "@/hooks/inventory/useSuppliers";

const Inventory = () => {
  const { suppliers } = useSuppliers();
  const [activeTab, setActiveTab] = useState("inventory");
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);
  const [isOrderMode, setIsOrderMode] = useState(false);
  const [productAdded, setProductAdded] = useState(false);

  // This effect will run once when the component mounts
  useEffect(() => {
    if (!productAdded) {
      setProductAdded(true);
    }
  }, [productAdded]);

  const handleStartOrder = (supplier: any) => {
    setSelectedSupplier(supplier);
    setIsOrderMode(true);
  };

  const handleBackToSuppliers = () => {
    setIsOrderMode(false);
    setSelectedSupplier(null);
  };

  const handleOrderComplete = () => {
    setIsOrderMode(false);
    setSelectedSupplier(null);
    setActiveTab("orders");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {!productAdded && <AddBrakeCleanerProduct />}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage parts, supplies, suppliers and orders
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">
            <PackageOpen className="h-4 w-4 mr-2" /> Inventory
          </TabsTrigger>
          <TabsTrigger value="suppliers">
            <Truck className="h-4 w-4 mr-2" /> Suppliers
          </TabsTrigger>
          <TabsTrigger value="orders">
            <FileText className="h-4 w-4 mr-2" /> Orders
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory" className="space-y-4">
          <ProductCatalog />
        </TabsContent>
        
        <TabsContent value="suppliers" className="space-y-4">
          {isOrderMode && selectedSupplier ? (
            <OrderForm 
              supplier={selectedSupplier} 
              onBack={handleBackToSuppliers} 
              onComplete={handleOrderComplete}
            />
          ) : (
            <div className="space-y-4">
              <Card className="col-span-1 md:col-span-3">
                <CardHeader className="p-4 pb-2">
                  <CardTitle>Supplier Management</CardTitle>
                  <CardDescription>Manage your suppliers and create orders</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {suppliers.map((supplier) => (
                      <Card key={supplier.id} className="flex flex-col">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            {supplier.name}
                          </CardTitle>
                          <CardDescription>{supplier.category}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2 pt-0">
                          <div className="text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">Contact:</span>
                              <span>{supplier.contactPerson}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">Email:</span>
                              <span className="text-xs">{supplier.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Phone:</span>
                              <span>{supplier.phone}</span>
                            </div>
                          </div>
                        </CardContent>
                        <div className="mt-auto p-4 pt-0">
                          <Button 
                            className="w-full" 
                            onClick={() => handleStartOrder(supplier)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" /> Create Order
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <SupplierManagement />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <OrderHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;
