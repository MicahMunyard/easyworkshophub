
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  Plus, 
  Search, 
  Package, 
  Phone, 
  Mail, 
  Calendar,
  Clock,
  ShoppingCart
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

const Suppliers = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
        <Button className="bg-workshop-blue hover:bg-workshop-blue/90">
          <Plus className="mr-2 h-4 w-4" /> Add Supplier
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-sidebar-accent text-sidebar-foreground">
          <TabsTrigger value="all">All Suppliers</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="orders">Pending Orders</TabsTrigger>
          <TabsTrigger value="history">Order History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>Supplier Directory</CardTitle>
              <CardDescription>
                Manage your parts and service suppliers
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search suppliers..." 
                  className="pl-8 bg-background"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Performance Parts Pro</TableCell>
                    <TableCell>Performance Parts</TableCell>
                    <TableCell>John Anderson</TableCell>
                    <TableCell>john@perfpartspro.com</TableCell>
                    <TableCell>June 15, 2024</TableCell>
                    <TableCell><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <ShoppingCart className="mr-2 h-4 w-4" /> Order
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Turbo Dynamics</TableCell>
                    <TableCell>Turbochargers</TableCell>
                    <TableCell>Lisa Reynolds</TableCell>
                    <TableCell>lisa@turbodynamics.com</TableCell>
                    <TableCell>June 10, 2024</TableCell>
                    <TableCell><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <ShoppingCart className="mr-2 h-4 w-4" /> Order
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Elite Racing Supplies</TableCell>
                    <TableCell>Racing Equipment</TableCell>
                    <TableCell>Mark Wilson</TableCell>
                    <TableCell>mark@eliteracing.com</TableCell>
                    <TableCell>May 28, 2024</TableCell>
                    <TableCell><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <ShoppingCart className="mr-2 h-4 w-4" /> Order
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">AutoPro Supplies</TableCell>
                    <TableCell>General Parts</TableCell>
                    <TableCell>Sarah Johnson</TableCell>
                    <TableCell>sarah@autopro.com</TableCell>
                    <TableCell>May 22, 2024</TableCell>
                    <TableCell><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <ShoppingCart className="mr-2 h-4 w-4" /> Order
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Precision Electronics</TableCell>
                    <TableCell>Electronics</TableCell>
                    <TableCell>David Chen</TableCell>
                    <TableCell>david@precisionelec.com</TableCell>
                    <TableCell>May 15, 2024</TableCell>
                    <TableCell><span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Inactive</span></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <ShoppingCart className="mr-2 h-4 w-4" /> Order
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="performance-card border-workshop-blue/20 hover:border-workshop-blue/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Suppliers
                </CardTitle>
                <Truck className="h-4 w-4 text-workshop-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +3 from last quarter
                </p>
              </CardContent>
            </Card>
            
            <Card className="performance-card border-workshop-green/20 hover:border-workshop-green/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Suppliers
                </CardTitle>
                <Package className="h-4 w-4 text-workshop-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">19</div>
                <p className="text-xs text-muted-foreground">
                  79% of total suppliers
                </p>
              </CardContent>
            </Card>
            
            <Card className="performance-card border-workshop-orange/20 hover:border-workshop-orange/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Orders
                </CardTitle>
                <Clock className="h-4 w-4 text-workshop-orange" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">
                  Worth $12,450 total
                </p>
              </CardContent>
            </Card>
            
            <Card className="performance-card border-workshop-red/20 hover:border-workshop-red/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Orders This Month
                </CardTitle>
                <Calendar className="h-4 w-4 text-workshop-red" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Worth $35,280 total
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>Active Suppliers</CardTitle>
              <CardDescription>
                Suppliers you've placed orders with in the last 90 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Performance Parts Pro</TableCell>
                    <TableCell>Performance Parts</TableCell>
                    <TableCell>John Anderson</TableCell>
                    <TableCell>(555) 123-4567</TableCell>
                    <TableCell>john@perfpartspro.com</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Turbo Dynamics</TableCell>
                    <TableCell>Turbochargers</TableCell>
                    <TableCell>Lisa Reynolds</TableCell>
                    <TableCell>(555) 234-5678</TableCell>
                    <TableCell>lisa@turbodynamics.com</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>Pending Orders</CardTitle>
              <CardDescription>
                Orders that are currently in processing or shipping
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Arrival</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">PO-2024-0045</TableCell>
                    <TableCell>Performance Parts Pro</TableCell>
                    <TableCell>12 items</TableCell>
                    <TableCell>June 15, 2024</TableCell>
                    <TableCell>June 22, 2024</TableCell>
                    <TableCell><span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Shipping</span></TableCell>
                    <TableCell>$3,450.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">PO-2024-0044</TableCell>
                    <TableCell>Turbo Dynamics</TableCell>
                    <TableCell>3 items</TableCell>
                    <TableCell>June 12, 2024</TableCell>
                    <TableCell>June 20, 2024</TableCell>
                    <TableCell><span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Processing</span></TableCell>
                    <TableCell>$2,800.00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                Complete history of supplier orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Received Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">PO-2024-0043</TableCell>
                    <TableCell>Elite Racing Supplies</TableCell>
                    <TableCell>8 items</TableCell>
                    <TableCell>June 5, 2024</TableCell>
                    <TableCell>June 10, 2024</TableCell>
                    <TableCell><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span></TableCell>
                    <TableCell>$1,850.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">PO-2024-0042</TableCell>
                    <TableCell>AutoPro Supplies</TableCell>
                    <TableCell>15 items</TableCell>
                    <TableCell>May 28, 2024</TableCell>
                    <TableCell>June 2, 2024</TableCell>
                    <TableCell><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span></TableCell>
                    <TableCell>$2,450.00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Suppliers;
