
import React from "react";
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
  BarChart2
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

const stockCategories = [
  { name: "Oil & Fluids", count: 24 },
  { name: "Filters", count: 15 },
  { name: "Brakes", count: 18 },
  { name: "Belts & Hoses", count: 12 },
  { name: "Electrical", count: 20 },
  { name: "Batteries", count: 8 },
  { name: "Tires", count: 16 }
];

const dummyItems = [
  {
    id: "INV-001",
    name: "Synthetic Oil 5W-30",
    category: "Oil & Fluids",
    supplier: "TOLICCS",
    inStock: 28,
    minStock: 10,
    price: 24.99,
    location: "Shelf A1",
    lastOrder: "2023-05-28",
    status: "normal"
  },
  {
    id: "INV-002",
    name: "Oil Filter - Standard",
    category: "Filters",
    supplier: "TOLICCS",
    inStock: 15,
    minStock: 8,
    price: 8.99,
    location: "Shelf B2",
    lastOrder: "2023-06-02",
    status: "normal"
  },
  {
    id: "INV-003",
    name: "Brake Pads - Front",
    category: "Brakes",
    supplier: "BrakeMaster",
    inStock: 4,
    minStock: 5,
    price: 45.50,
    location: "Shelf C3",
    lastOrder: "2023-05-15",
    status: "low"
  },
  {
    id: "INV-004",
    name: "Windshield Wipers 22\"",
    category: "Accessories",
    supplier: "TOLICCS",
    inStock: 2,
    minStock: 6,
    price: 15.99,
    location: "Shelf D4",
    lastOrder: "2023-04-20",
    status: "critical"
  },
  {
    id: "INV-005",
    name: "Air Filter",
    category: "Filters",
    supplier: "TOLICCS",
    inStock: 7,
    minStock: 8,
    price: 12.50,
    location: "Shelf B1",
    lastOrder: "2023-05-10",
    status: "low"
  }
];

const Inventory = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage parts, supplies and stock levels
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
          <Button className="h-9">
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="col-span-1 md:row-span-2">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start font-normal hover:bg-muted">
                All Items <Badge className="ml-auto">{stockCategories.reduce((acc, cat) => acc + cat.count, 0)}</Badge>
              </Button>
              {stockCategories.map((category) => (
                <Button key={category.name} variant="ghost" className="w-full justify-start font-normal hover:bg-muted">
                  {category.name} <Badge variant="outline" className="ml-auto">{category.count}</Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-3">
          <CardHeader className="p-4 pb-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <CardTitle>Inventory Items</CardTitle>
              <Tabs defaultValue="all" className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All Items</TabsTrigger>
                  <TabsTrigger value="low">Low Stock</TabsTrigger>
                  <TabsTrigger value="ordered">On Order</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search inventory..."
                  className="w-full rounded-md border border-input bg-transparent pl-8 pr-4 py-2 text-sm focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <div className="border rounded-md divide-y">
              <div className="bg-muted px-4 py-2.5 text-xs font-semibold text-muted-foreground grid grid-cols-12 gap-4">
                <div className="col-span-4">Item</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-3">Stock Level</div>
                <div className="col-span-2">Location</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              {dummyItems.map((item) => {
                const stockPercentage = (item.inStock / item.minStock) * 100;
                return (
                  <div key={item.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-muted/50">
                    <div className="col-span-4">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground flex gap-1 items-center">
                        <span>{item.category}</span>
                        <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground"></span>
                        <span>{item.supplier}</span>
                      </div>
                    </div>
                    <div className="col-span-2 font-medium">
                      ${item.price.toFixed(2)}
                    </div>
                    <div className="col-span-3">
                      <div className="flex justify-between text-sm">
                        <span>{item.inStock} in stock</span>
                        <span className={cn(
                          item.status === "critical" ? "text-destructive" :
                          item.status === "low" ? "text-amber-500" : "text-muted-foreground"
                        )}>
                          Min: {item.minStock}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(stockPercentage, 100)} 
                        className={cn(
                          "h-2 mt-1",
                          item.status === "critical" ? "text-destructive" :
                          item.status === "low" ? "text-amber-500" : ""
                        )} 
                      />
                    </div>
                    <div className="col-span-2 text-sm">
                      {item.location}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Item</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <ShoppingCart className="h-4 w-4 mr-2" /> Order More
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <BarChart2 className="h-4 w-4 mr-2" /> Usage History
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-3">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Inventory Summary</CardTitle>
            <CardDescription>Current stock status and alerts</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-md">
                <div className="h-10 w-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center">
                  <PackageOpen className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Items</div>
                  <div className="text-2xl font-bold">152</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-md">
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-sm text-amber-700 dark:text-amber-400">Low Stock</div>
                  <div className="text-2xl font-bold">8</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-md">
                <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <div className="text-sm text-destructive">Out of Stock</div>
                  <div className="text-2xl font-bold">3</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Recent Activity</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <ArrowUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Oil Filters received</div>
                      <div className="text-xs text-muted-foreground">20 units from TOLICCS</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <ArrowDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Brake Pads used</div>
                      <div className="text-xs text-muted-foreground">2 units for Job #1236</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">Yesterday</div>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Low stock alert</div>
                      <div className="text-xs text-muted-foreground">Windshield Wipers (2 remaining)</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">2 days ago</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Inventory;
