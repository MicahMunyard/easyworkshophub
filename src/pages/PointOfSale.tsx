
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  Tag, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Receipt, 
  DollarSign,
  Search 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const PointOfSale = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Catalog */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>
                Search for products by name, code, or category
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search products..." 
                  className="pl-8 bg-background"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Product cards */}
                <Card className="relative overflow-hidden border-workshop-blue/20 hover:border-workshop-blue/50 transition-all cursor-pointer">
                  <div className="absolute top-2 right-2 z-10">
                    <Tag className="h-4 w-4 text-workshop-blue" />
                  </div>
                  <CardContent className="p-4 flex flex-col items-center">
                    <div className="w-full h-32 rounded-md bg-muted mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-muted-foreground">Oil</span>
                    </div>
                    <h3 className="font-medium text-center">Synthetic Oil (5W-30)</h3>
                    <p className="mt-1 text-sm text-muted-foreground text-center">Premium Engine Oil</p>
                    <div className="mt-3 font-bold text-workshop-blue">$45.99</div>
                  </CardContent>
                </Card>
                
                <Card className="relative overflow-hidden border-workshop-blue/20 hover:border-workshop-blue/50 transition-all cursor-pointer">
                  <div className="absolute top-2 right-2 z-10">
                    <Tag className="h-4 w-4 text-workshop-blue" />
                  </div>
                  <CardContent className="p-4 flex flex-col items-center">
                    <div className="w-full h-32 rounded-md bg-muted mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-muted-foreground">Filter</span>
                    </div>
                    <h3 className="font-medium text-center">Oil Filter</h3>
                    <p className="mt-1 text-sm text-muted-foreground text-center">High Performance Filter</p>
                    <div className="mt-3 font-bold text-workshop-blue">$12.99</div>
                  </CardContent>
                </Card>
                
                <Card className="relative overflow-hidden border-workshop-blue/20 hover:border-workshop-blue/50 transition-all cursor-pointer">
                  <div className="absolute top-2 right-2 z-10">
                    <Tag className="h-4 w-4 text-workshop-blue" />
                  </div>
                  <CardContent className="p-4 flex flex-col items-center">
                    <div className="w-full h-32 rounded-md bg-muted mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-muted-foreground">Fluid</span>
                    </div>
                    <h3 className="font-medium text-center">Brake Fluid DOT 4</h3>
                    <p className="mt-1 text-sm text-muted-foreground text-center">High Temperature Resistant</p>
                    <div className="mt-3 font-bold text-workshop-blue">$18.99</div>
                  </CardContent>
                </Card>
                
                <Card className="relative overflow-hidden border-workshop-blue/20 hover:border-workshop-blue/50 transition-all cursor-pointer">
                  <div className="absolute top-2 right-2 z-10">
                    <Tag className="h-4 w-4 text-workshop-blue" />
                  </div>
                  <CardContent className="p-4 flex flex-col items-center">
                    <div className="w-full h-32 rounded-md bg-muted mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-muted-foreground">Wiper</span>
                    </div>
                    <h3 className="font-medium text-center">Wiper Blades</h3>
                    <p className="mt-1 text-sm text-muted-foreground text-center">All Weather Performance</p>
                    <div className="mt-3 font-bold text-workshop-blue">$24.99</div>
                  </CardContent>
                </Card>
                
                <Card className="relative overflow-hidden border-workshop-blue/20 hover:border-workshop-blue/50 transition-all cursor-pointer">
                  <div className="absolute top-2 right-2 z-10">
                    <Tag className="h-4 w-4 text-workshop-blue" />
                  </div>
                  <CardContent className="p-4 flex flex-col items-center">
                    <div className="w-full h-32 rounded-md bg-muted mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-muted-foreground">Spark</span>
                    </div>
                    <h3 className="font-medium text-center">Spark Plugs (Set of 4)</h3>
                    <p className="mt-1 text-sm text-muted-foreground text-center">Iridium Performance</p>
                    <div className="mt-3 font-bold text-workshop-blue">$32.99</div>
                  </CardContent>
                </Card>
                
                <Card className="relative overflow-hidden border-workshop-blue/20 hover:border-workshop-blue/50 transition-all cursor-pointer">
                  <div className="absolute top-2 right-2 z-10">
                    <Tag className="h-4 w-4 text-workshop-blue" />
                  </div>
                  <CardContent className="p-4 flex flex-col items-center">
                    <div className="w-full h-32 rounded-md bg-muted mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-muted-foreground">Air</span>
                    </div>
                    <h3 className="font-medium text-center">Air Filter</h3>
                    <p className="mt-1 text-sm text-muted-foreground text-center">High Flow Performance</p>
                    <div className="mt-3 font-bold text-workshop-blue">$29.99</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Cart */}
        <div className="space-y-4">
          <Card className="performance-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" /> Cart
              </CardTitle>
              <CardDescription>
                Current transaction (3 items)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">Synthetic Oil (5W-30)</h4>
                    <p className="text-sm text-muted-foreground">$45.99</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">1</span>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">Oil Filter</h4>
                    <p className="text-sm text-muted-foreground">$12.99</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">1</span>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">Air Filter</h4>
                    <p className="text-sm text-muted-foreground">$29.99</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">1</span>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>$88.97</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (7%)</span>
                  <span>$6.23</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>$95.20</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Input placeholder="Customer name or phone number" className="w-full" />
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button className="w-full bg-workshop-blue hover:bg-workshop-blue/90">
                  <Receipt className="mr-2 h-4 w-4" /> Save
                </Button>
                <Button className="w-full bg-workshop-green hover:bg-workshop-green/90">
                  <CreditCard className="mr-2 h-4 w-4" /> Pay
                </Button>
              </div>
              <Button variant="outline" className="w-full">
                <DollarSign className="mr-2 h-4 w-4" /> Apply Discount
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full justify-start">
                  <Receipt className="mr-2 h-4 w-4" /> Open Order
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PointOfSale;
