
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  ArrowUpRight, 
  Users, 
  Package, 
  FileText, 
  Briefcase, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Gauge,
  Wrench,
  Car,
  Settings,
  Play,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable";

const StatsCard = ({ title, value, icon: Icon, trend, description }: { 
  title: string; 
  value: string; 
  icon: React.ElementType;
  trend?: string;
  description?: string;
}) => (
  <Card className="overflow-hidden transition-all hover:shadow-md performance-card relative group">
    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="h-8 w-8 rounded-full bg-workshop-red/10 flex items-center justify-center text-workshop-red">
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent className="p-4 pt-1">
      <div className="flex items-center">
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="ml-2 flex items-center text-xs text-emerald-500 font-medium">
            <ArrowUpRight className="h-3 w-3 mr-0.5" />
            {trend}
          </div>
        )}
      </div>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
    <div className="absolute inset-0 border-b-2 border-workshop-red/0 group-hover:border-workshop-red/100 transition-all duration-300"></div>
  </Card>
);

interface VideoWidgetProps {
  videoId?: string;
  title?: string;
}

const VideoWidget: React.FC<VideoWidgetProps> = ({ 
  videoId = "dQw4w9WgXcQ", 
  title = "Tutorial Video" 
}) => {
  const [playing, setPlaying] = useState(false);
  
  return (
    <Card className="h-full">
      <CardHeader className="p-4 pb-2 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Video className="mr-2 h-5 w-5 text-workshop-red" />
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col items-center justify-center h-[calc(100%-4rem)]">
        <div className="relative w-full h-full bg-black/90 rounded-lg flex items-center justify-center">
          {!playing ? (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-16 w-16 rounded-full bg-white/20 hover:bg-white/30"
              onClick={() => setPlaying(true)}
            >
              <Play className="h-8 w-8 text-white" />
            </Button>
          ) : (
            <iframe 
              className="w-full h-full rounded-lg" 
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} 
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  // This should be fetched from your backend based on the current account
  // For now, we're hardcoding a demonstration video ID
  const accountVideoId = "dQw4w9WgXcQ"; // Replace with API call to get account-specific video

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Gauge className="mr-2 h-7 w-7 text-workshop-red" /> 
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Workshop overview and performance metrics.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9">
            <Clock className="h-4 w-4 mr-2" /> Last 30 days
          </Button>
          <Button 
            className="h-9 bg-workshop-red hover:bg-workshop-red/90"
            onClick={() => navigate("/reports")}
          >
            <TrendingUp className="h-4 w-4 mr-2" /> View Reports
          </Button>
        </div>
      </div>

      {/* Featured Video Widget - Now positioned above the stats cards */}
      <div className="w-full" style={{ height: "400px" }}>
        <VideoWidget 
          videoId={accountVideoId} 
          title="Workshop Tutorial: Getting Started"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Today's Bookings" 
          value="12" 
          icon={Calendar} 
          trend="4 more than yesterday"
        />
        <StatsCard 
          title="Active Jobs" 
          value="18" 
          icon={Briefcase} 
          description="3 overdue"
        />
        <StatsCard 
          title="Revenue (Today)" 
          value="$1,854" 
          icon={FileText} 
          trend="12% up from last week"
        />
        <StatsCard 
          title="Low Stock Items" 
          value="7" 
          icon={Package} 
          description="Needs attention"
        />
      </div>

      {/* Remove the duplicate VideoWidget in the right panel */}
      <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
        <ResizablePanel defaultSize={65}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={60}>
              <div className="flex h-full items-center justify-center p-4">
                <Card className="w-full h-full overflow-hidden performance-card">
                  <CardHeader className="p-4 pb-2 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Calendar className="mr-2 h-5 w-5 text-workshop-red" />
                        Upcoming Appointments
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-sm gap-1 hover:text-workshop-red"
                        onClick={() => navigate("/booking-diary")}
                      >
                        View All <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {[
                        { time: "9:30 AM", customer: "John Smith", service: "Oil Change", car: "2018 Toyota Camry" },
                        { time: "11:00 AM", customer: "Sara Johnson", service: "Brake Inspection", car: "2020 Honda Civic" },
                        { time: "1:30 PM", customer: "Mike Davis", service: "Tire Rotation", car: "2019 Ford F-150" },
                        { time: "3:00 PM", customer: "Emma Wilson", service: "Full Service", car: "2021 Tesla Model 3" },
                      ].map((appointment, i) => (
                        <div key={i} className="px-4 py-3 flex items-center justify-between group hover:bg-muted/40">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-workshop-red/10 text-workshop-red flex items-center justify-center font-medium text-sm">
                              {appointment.time.split(" ")[0]}
                            </div>
                            <div>
                              <div className="font-medium">{appointment.customer}</div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Car className="h-3 w-3 mr-1" /> {appointment.car} • <Wrench className="h-3 w-3 mx-1" /> {appointment.service}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-workshop-red hover:text-white">
                            Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40}>
              <div className="flex h-full items-center justify-center p-4">
                <Card className="w-full h-full overflow-hidden performance-card carbon-texture">
                  <CardHeader className="p-4 pb-2 border-b border-border/50">
                    <div className="flex items-center">
                      <Settings className="mr-2 h-5 w-5 text-workshop-red" />
                      <div>
                        <CardTitle>Workshop Stats</CardTitle>
                        <CardDescription>Current performance metrics</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Technician Efficiency</span>
                        <span className="font-medium">87%</span>
                      </div>
                      <Progress value={87} className="h-2 bg-muted" indicatorClassName="bg-workshop-red" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Job Completion Rate</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2 bg-muted" indicatorClassName="bg-workshop-red" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Customer Satisfaction</span>
                        <span className="font-medium">94%</span>
                      </div>
                      <Progress value={94} className="h-2 bg-muted" indicatorClassName="bg-workshop-red" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Parts Availability</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-2 bg-muted" indicatorClassName="bg-workshop-red" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={35}>
          <div className="flex h-full items-center justify-center p-4">
            {/* This would be a good place to add additional content or information */}
            <Card className="w-full h-full overflow-hidden performance-card">
              <CardHeader className="p-4 pb-2 border-b border-border/50">
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-workshop-red" />
                  Important Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      3 vehicles are awaiting parts that are currently on backorder.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      New software update available for diagnostic equipment.
                    </p>
                  </div>
                  <div className="p-3 bg-workshop-red/10 border border-workshop-red/20 rounded-lg">
                    <p className="text-sm text-workshop-red">
                      Safety recall notice for certain 2021-2022 model vehicles.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <div className="grid gap-4 md:grid-cols-12">
        <Card className="col-span-12 md:col-span-8 performance-card">
          <CardHeader className="p-4 pb-2 border-b border-border/50">
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-workshop-red" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {[
                { icon: Users, text: "New customer registered: David Miller", time: "10 mins ago" },
                { icon: Briefcase, text: "Job #1234 completed by technician Alex", time: "25 mins ago" },
                { icon: Package, text: "5 brake pads received from supplier", time: "1 hour ago" },
                { icon: FileText, text: "Invoice #7890 paid by Emma Wilson", time: "2 hours ago" },
                { icon: AlertCircle, text: "Low stock alert: Oil filters (4 remaining)", time: "3 hours ago" }
              ].map((activity, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-muted/40">
                  <div className="h-8 w-8 rounded-full bg-workshop-red/10 flex items-center justify-center mt-0.5 text-workshop-red">
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm">{activity.text}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 md:col-span-4 performance-card">
          <CardHeader className="p-4 pb-2 border-b border-border/50">
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-workshop-red" />
              Inventory Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {[
                { name: "Oil Filters", stock: "4 remaining", status: "low" },
                { name: "Brake Pads", stock: "3 remaining", status: "low" },
                { name: "Windshield Wipers", stock: "2 remaining", status: "critical" },
                { name: "Air Filters", stock: "5 remaining", status: "low" }
              ].map((item, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-muted/40">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.stock}</div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'critical' ? 'bg-workshop-red/20 text-workshop-red' : 
                    'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-500'
                  }`}>
                    {item.status === 'critical' ? 'Critical' : 'Low'}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 pt-2">
              <Button 
                variant="outline" 
                className="w-full hover:bg-workshop-red hover:text-white"
                onClick={() => navigate("/suppliers")}
              >
                Order Supplies
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
