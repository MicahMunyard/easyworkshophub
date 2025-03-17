
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const Customers = () => {
  // This is a placeholder component for the Customers page
  // It will be expanded with actual functionality in future iterations

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-sidebar-accent text-sidebar-foreground">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="all">All Customers</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="performance-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
                <Progress value={70} className="mt-3 h-2" indicatorClassName="bg-workshop-red" />
              </CardContent>
            </Card>
            
            <Card className="performance-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">178</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last month
                </p>
                <Progress value={85} className="mt-3 h-2" indicatorClassName="bg-workshop-blue" />
              </CardContent>
            </Card>
            
            <Card className="performance-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  New Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +18% from last month
                </p>
                <Progress value={45} className="mt-3 h-2" indicatorClassName="bg-workshop-orange" />
              </CardContent>
            </Card>
          </div>
          
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>Recent Customers</CardTitle>
              <CardDescription>
                Showing your most recently added customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>All Customers</CardTitle>
              <CardDescription>
                Complete list of all customers will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                {/* Customer list table will go here */}
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">Customer data being loaded...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>Active Customers</CardTitle>
              <CardDescription>
                Customers with recent activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">Active customers will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inactive" className="space-y-4">
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>Inactive Customers</CardTitle>
              <CardDescription>
                Customers with no recent activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">Inactive customers will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Customers;
