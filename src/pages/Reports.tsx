
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Wrench
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for charts - in a real application, this would be fetched from an API
const revenueData = [
  { name: "Jan", value: 18500 },
  { name: "Feb", value: 21200 },
  { name: "Mar", value: 25800 },
  { name: "Apr", value: 22300 },
  { name: "May", value: 29100 },
  { name: "Jun", value: 32500 },
];

const customersData = [
  { name: "Jan", value: 45 },
  { name: "Feb", value: 52 },
  { name: "Mar", value: 48 },
  { name: "Apr", value: 61 },
  { name: "May", value: 67 },
  { name: "Jun", value: 73 },
];

const jobsData = [
  { name: "Jan", value: 78 },
  { name: "Feb", value: 81 },
  { name: "Mar", value: 92 },
  { name: "Apr", value: 86 },
  { name: "May", value: 97 },
  { name: "Jun", value: 105 },
];

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" /> Date Range
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList className="bg-sidebar-accent text-sidebar-foreground">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        
        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="performance-card border-workshop-green/20 hover:border-workshop-green/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-workshop-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$32,500</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +12% from last month
                </div>
              </CardContent>
            </Card>
            
            <Card className="performance-card border-workshop-blue/20 hover:border-workshop-blue/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Job Value
                </CardTitle>
                <Wrench className="h-4 w-4 text-workshop-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$895</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +5% from last month
                </div>
              </CardContent>
            </Card>
            
            <Card className="performance-card border-workshop-orange/20 hover:border-workshop-orange/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Parts Revenue
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-workshop-orange" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$13,250</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +8% from last month
                </div>
              </CardContent>
            </Card>
            
            <Card className="performance-card border-workshop-red/20 hover:border-workshop-red/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Labor Revenue
                </CardTitle>
                <Clock className="h-4 w-4 text-workshop-red" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$19,250</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +15% from last month
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="performance-card">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>
                  Monthly revenue over the past 6 months
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                  Revenue Chart (Placeholder)
                </div>
              </CardContent>
            </Card>
            
            <Card className="performance-card">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>
                  Revenue by service category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                  Revenue Breakdown Chart (Placeholder)
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="operations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="performance-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Jobs Completed
                </CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">105</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +8% from last month
                </div>
              </CardContent>
            </Card>
            
            <Card className="performance-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Completion Time
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3 days</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingDown className="mr-1 h-3 w-3" />
                  -5% from last month
                </div>
              </CardContent>
            </Card>
            
            <Card className="performance-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Shop Utilization
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +4% from last month
                </div>
              </CardContent>
            </Card>
            
            <Card className="performance-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Technician Efficiency
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +2% from last month
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="performance-card">
              <CardHeader>
                <CardTitle>Jobs Trend</CardTitle>
                <CardDescription>
                  Job volume over the past 6 months
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                  Jobs Trend Chart (Placeholder)
                </div>
              </CardContent>
            </Card>
            
            <Card className="performance-card">
              <CardHeader>
                <CardTitle>Job Types</CardTitle>
                <CardDescription>
                  Breakdown by service type
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                  Job Types Chart (Placeholder)
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="performance-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +5% from last month
                </div>
              </CardContent>
            </Card>
            
            <Card className="performance-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  New Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +18% from last month
                </div>
              </CardContent>
            </Card>
            
            <Card className="performance-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Customer Retention
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">82%</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +3% from last month
                </div>
              </CardContent>
            </Card>
            
            <Card className="performance-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Lifetime Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$3,750</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +7% from last month
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="performance-card">
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>
                  New customers over the past 6 months
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                  Customer Growth Chart (Placeholder)
                </div>
              </CardContent>
            </Card>
            
            <Card className="performance-card">
              <CardHeader>
                <CardTitle>Vehicle Types</CardTitle>
                <CardDescription>
                  Customer vehicles by make and model
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                  Vehicle Types Chart (Placeholder)
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="performance-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Inventory Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$125,750</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +8% from last month
                </div>
              </CardContent>
            </Card>
            
            <Card className="performance-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Low Stock Items
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <div className="flex items-center text-xs text-red-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +3 from last month
                </div>
              </CardContent>
            </Card>
            
            <Card className="performance-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Inventory Turnover
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6.2x</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +0.4x from last month
                </div>
              </CardContent>
            </Card>
            
            <Card className="performance-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Out of Stock Items
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingDown className="mr-1 h-3 w-3" />
                  -2 from last month
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="performance-card">
              <CardHeader>
                <CardTitle>Inventory Value Trend</CardTitle>
                <CardDescription>
                  Total inventory value over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                  Inventory Value Chart (Placeholder)
                </div>
              </CardContent>
            </Card>
            
            <Card className="performance-card">
              <CardHeader>
                <CardTitle>Inventory Categories</CardTitle>
                <CardDescription>
                  Breakdown by product category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                  Inventory Categories Chart (Placeholder)
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
