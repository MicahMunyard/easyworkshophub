
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
import { FileText, Plus, CreditCard, FileCheck, Clock, FileX } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const Invoices = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <Button className="bg-workshop-red hover:bg-workshop-red/90">
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-sidebar-accent text-sidebar-foreground">
          <TabsTrigger value="all">All Invoices</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="performance-card border-workshop-red/20 hover:border-workshop-red/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Invoices
                </CardTitle>
                <FileText className="h-4 w-4 text-workshop-red" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">159</div>
                <p className="text-xs text-muted-foreground">
                  +23 from last month
                </p>
              </CardContent>
            </Card>
            
            <Card className="performance-card border-workshop-green/20 hover:border-workshop-green/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Paid Invoices
                </CardTitle>
                <FileCheck className="h-4 w-4 text-workshop-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">124</div>
                <p className="text-xs text-muted-foreground">
                  +18 from last month
                </p>
              </CardContent>
            </Card>
            
            <Card className="performance-card border-workshop-orange/20 hover:border-workshop-orange/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Invoices
                </CardTitle>
                <Clock className="h-4 w-4 text-workshop-orange" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">27</div>
                <p className="text-xs text-muted-foreground">
                  +5 from last month
                </p>
              </CardContent>
            </Card>
            
            <Card className="performance-card border-destructive/20 hover:border-destructive/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overdue Invoices
                </CardTitle>
                <FileX className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  -3 from last month
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>
                Your most recently created invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">INV-2024-0159</TableCell>
                    <TableCell>Alex Johnson</TableCell>
                    <TableCell>Performance Tuning</TableCell>
                    <TableCell>June 12, 2024</TableCell>
                    <TableCell>$1,950.00</TableCell>
                    <TableCell><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Paid</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">INV-2024-0158</TableCell>
                    <TableCell>Michael Smith</TableCell>
                    <TableCell>Brake System Upgrade</TableCell>
                    <TableCell>June 10, 2024</TableCell>
                    <TableCell>$875.00</TableCell>
                    <TableCell><span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">Pending</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">INV-2024-0157</TableCell>
                    <TableCell>Sarah Williams</TableCell>
                    <TableCell>Oil Change & Inspection</TableCell>
                    <TableCell>June 9, 2024</TableCell>
                    <TableCell>$225.00</TableCell>
                    <TableCell><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Paid</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">INV-2024-0156</TableCell>
                    <TableCell>David Miller</TableCell>
                    <TableCell>Exhaust System Installation</TableCell>
                    <TableCell>June 8, 2024</TableCell>
                    <TableCell>$1,250.00</TableCell>
                    <TableCell><span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Overdue</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">INV-2024-0155</TableCell>
                    <TableCell>Emma Davis</TableCell>
                    <TableCell>Suspension Upgrade</TableCell>
                    <TableCell>June 7, 2024</TableCell>
                    <TableCell>$2,100.00</TableCell>
                    <TableCell><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Paid</span></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="paid" className="space-y-4">
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>Paid Invoices</CardTitle>
              <CardDescription>
                All invoices that have been paid in full
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">INV-2024-0159</TableCell>
                      <TableCell>Alex Johnson</TableCell>
                      <TableCell>Performance Tuning</TableCell>
                      <TableCell>June 12, 2024</TableCell>
                      <TableCell>$1,950.00</TableCell>
                      <TableCell>Credit Card</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">INV-2024-0157</TableCell>
                      <TableCell>Sarah Williams</TableCell>
                      <TableCell>Oil Change & Inspection</TableCell>
                      <TableCell>June 9, 2024</TableCell>
                      <TableCell>$225.00</TableCell>
                      <TableCell>Debit Card</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">INV-2024-0155</TableCell>
                      <TableCell>Emma Davis</TableCell>
                      <TableCell>Suspension Upgrade</TableCell>
                      <TableCell>June 7, 2024</TableCell>
                      <TableCell>$2,100.00</TableCell>
                      <TableCell>Bank Transfer</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>Pending Invoices</CardTitle>
              <CardDescription>
                Invoices waiting for payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">INV-2024-0158</TableCell>
                      <TableCell>Michael Smith</TableCell>
                      <TableCell>Brake System Upgrade</TableCell>
                      <TableCell>June 10, 2024</TableCell>
                      <TableCell>$875.00</TableCell>
                      <TableCell>June 24, 2024</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="overdue" className="space-y-4">
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>Overdue Invoices</CardTitle>
              <CardDescription>
                Invoices past their due date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">INV-2024-0156</TableCell>
                      <TableCell>David Miller</TableCell>
                      <TableCell>Exhaust System Installation</TableCell>
                      <TableCell>June 8, 2024</TableCell>
                      <TableCell>$1,250.00</TableCell>
                      <TableCell>June 15, 2024</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <CreditCard className="mr-2 h-4 w-4" /> Collect
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Invoices;
