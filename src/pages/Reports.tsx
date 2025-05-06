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
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import {
  useRevenueReports,
  useOperationsReports,
  useCustomerReports,
  useInventoryReports
} from "@/hooks/reports";

// Recharts components for data visualization
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const Reports = () => {
  const { user } = useAuth();
  
  const {
    monthlyRevenue,
    averageJobValue,
    partsRevenue,
    laborRevenue,
    revenueData,
    revenueChangePercent,
    avgJobValueChangePercent, 
    partsRevenueChangePercent,
    laborRevenueChangePercent,
    isLoading: revenueLoading
  } = useRevenueReports();
  
  const {
    jobsCompleted,
    averageCompletionTime,
    shopUtilization,
    technicianEfficiency,
    jobsData,
    jobsChangePercent,
    completionTimeChangePercent,
    utilizationChangePercent,
    efficiencyChangePercent,
    isLoading: operationsLoading
  } = useOperationsReports();
  
  const {
    totalCustomers,
    newCustomers,
    customerRetention,
    averageLifetimeValue,
    customerData,
    newCustomersChangePercent,
    retentionChangePercent,
    lifetimeValueChangePercent,
    isLoading: customersLoading
  } = useCustomerReports();
  
  const {
    totalInventoryValue,
    lowStockItems,
    inventoryTurnover,
    outOfStockItems,
    inventoryData,
    changeFromLastMonth,
    isLoading: inventoryLoading
  } = useInventoryReports();

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Revenue breakdown data for pie chart
  const revenueBreakdownData = [
    { name: 'Parts', value: partsRevenue },
    { name: 'Labor', value: laborRevenue },
  ];

  // Helper to determine if a trend is positive (useful for styling)
  const isTrendPositive = (value: number, inverse: boolean = false) => {
    return inverse ? value < 0 : value > 0;
  };

  // Helper to render trend indicator with proper styling
  const renderTrend = (value: number, label: string, inverse: boolean = false) => {
    const isPositive = isTrendPositive(value, inverse);
    return (
      <div className={`flex items-center text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? (
          <TrendingUp className="mr-1 h-3 w-3" />
        ) : (
          <TrendingDown className="mr-1 h-3 w-3" />
        )}
        {Math.abs(value)}% {label}
      </div>
    );
  };

  const renderSkeleton = () => (
    <div className="flex flex-col space-y-2">
      <Skeleton className="h-[40px] w-[100px]" />
      <Skeleton className="h-[20px] w-[80px]" />
    </div>
  );

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your reports</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You need to be logged in to access workshop reports and analytics.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                {revenueLoading ? (
                  renderSkeleton()
                ) : (
                  <>
                    <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</div>
                    {renderTrend(revenueChangePercent, "from last month")}
                  </>
                )}
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
                {revenueLoading ? (
                  renderSkeleton()
                ) : (
                  <>
                    <div className="text-2xl font-bold">{formatCurrency(averageJobValue)}</div>
                    {renderTrend(avgJobValueChangePercent, "from last month")}
                  </>
                )}
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
                {revenueLoading ? (
                  renderSkeleton()
                ) : (
                  <>
                    <div className="text-2xl font-bold">{formatCurrency(partsRevenue)}</div>
                    {renderTrend(partsRevenueChangePercent, "from last month")}
                  </>
                )}
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
                {revenueLoading ? (
                  renderSkeleton()
                ) : (
                  <>
                    <div className="text-2xl font-bold">{formatCurrency(laborRevenue)}</div>
                    {renderTrend(laborRevenueChangePercent, "from last month")}
                  </>
                )}
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
                {revenueLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                      <Bar dataKey="value" fill="#16a34a" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
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
                {revenueLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueBreakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
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
                {operationsLoading ? (
                  renderSkeleton()
                ) : (
                  <>
                    <div className="text-2xl font-bold">{jobsCompleted}</div>
                    {renderTrend(jobsChangePercent, "from last month")}
                  </>
                )}
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
                {operationsLoading ? (
                  renderSkeleton()
                ) : (
                  <>
                    <div className="text-2xl font-bold">{averageCompletionTime.toFixed(1)} days</div>
                    {renderTrend(completionTimeChangePercent, "from last month", true)}
                  </>
                )}
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
                {operationsLoading ? (
                  renderSkeleton()
                ) : (
                  <>
                    <div className="text-2xl font-bold">{shopUtilization}%</div>
                    {renderTrend(utilizationChangePercent, "from last month")}
                  </>
                )}
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
                {operationsLoading ? (
                  renderSkeleton()
                ) : (
                  <>
                    <div className="text-2xl font-bold">{technicianEfficiency}%</div>
                    {renderTrend(efficiencyChangePercent, "from last month")}
                  </>
                )}
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
                {operationsLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={jobsData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Jobs"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
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
                  Job Types Chart (Coming Soon)
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
                {customersLoading ? (
                  renderSkeleton()
                ) : (
                  <>
                    <div className="text-2xl font-bold">{totalCustomers}</div>
                    <div className="flex items-center text-xs text-green-600">
                      {newCustomers > 0 && (
                        <>
                          <TrendingUp className="mr-1 h-3 w-3" />
                          {newCustomers} new this month
                        </>
                      )}
                    </div>
                  </>
                )}
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
                {customersLoading ? (
                  renderSkeleton()
                ) : (
                  <>
                    <div className="text-2xl font-bold">{newCustomers}</div>
                    {renderTrend(newCustomersChangePercent, "from last month")}
                  </>
                )}
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
                {customersLoading ? (
                  renderSkeleton()
                ) : (
                  <>
                    <div className="text-2xl font-bold">{customerRetention}%</div>
                    {renderTrend(retentionChangePercent, "from last month")}
                  </>
                )}
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
                {customersLoading ? (
                  renderSkeleton()
                ) : (
                  <>
                    <div className="text-2xl font-bold">{formatCurrency(averageLifetimeValue)}</div>
                    {renderTrend(lifetimeValueChangePercent, "from last month")}
                  </>
                )}
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
                {customersLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={customerData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#82ca9d" name="New Customers" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
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
                  Vehicle Types Chart (Coming Soon)
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
                {inventoryLoading ? (
                  renderSkeleton()
                ) : (
                  <>
                    <div className="text-2xl font-bold">{formatCurrency(totalInventoryValue)}</div>
                    {renderTrend(changeFromLastMonth, "from last month")}
                  </>
                )}
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
                {inventoryLoading ? (
                  renderSkeleton()
                ) : (
                  <>
                    <div className="text-2xl font-bold">{lowStockItems}</div>
                    <div className="flex items-center text-xs text-red-600">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      Need attention
                    </div>
                  </>
                )}
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
                {inventoryLoading ? (
                  renderSkeleton()
                ) : (
                  <>
                    <div className="text-2xl font-bold">{inventoryTurnover.toFixed(1)}x</div>
                    <div className="flex items-center text-xs text-green-600">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      Healthy rotation
                    </div>
                  </>
                )}
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
                {inventoryLoading ? (
                  renderSkeleton()
                ) : (
                  <>
                    <div className="text-2xl font-bold">{outOfStockItems}</div>
                    <div className="flex items-center text-xs text-red-600">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      Need reordering
                    </div>
                  </>
                )}
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
                {inventoryLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={inventoryData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                      <Tooltip formatter={(value) => [`$${value}`, 'Inventory Value']} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Inventory Value"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
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
                  Inventory Categories Chart (Coming Soon)
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
