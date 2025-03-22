import React, { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

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
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [todayBookingsCount, setTodayBookingsCount] = useState<number>(0);
  const [activeJobsCount, setActiveJobsCount] = useState<number>(0);
  const [todayRevenue, setTodayRevenue] = useState<number>(0);
  const [lowStockItems, setLowStockItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const accountVideoId = "dQw4w9WgXcQ";

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setAppointments([]);
        setTodayBookingsCount(0);
        setActiveJobsCount(0);
        setTodayRevenue(0);
        setLowStockItems(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('user_bookings')
          .select('*')
          .eq('booking_date', today)
          .eq('user_id', user.id);
          
        if (bookingsError) throw bookingsError;
        
        setAppointments(bookingsData || []);
        
        const revenue = bookingsData?.reduce((sum, booking) => sum + (booking.cost || 0), 0) || 0;
        setTodayRevenue(revenue);
        
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'inProgress');
          
        if (jobsError) throw jobsError;
        
        setActiveJobsCount(jobsData?.length || 0);
        
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('user_inventory_items')
          .select('*')
          .eq('user_id', user.id)
          .lt('in_stock', supabase.raw('min_stock'));
          
        if (inventoryError) throw inventoryError;
        
        setLowStockItems(inventoryData?.length || 0);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    
    const intervalId = setInterval(fetchDashboardData, 60000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  const formattedAppointments = appointments.map(appointment => ({
    time: appointment.booking_time,
    customer: appointment.customer_name,
    service: appointment.service,
    car: appointment.car,
  }));

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

      <div className="w-full" style={{ height: "400px" }}>
        <VideoWidget 
          videoId={accountVideoId} 
          title="Workshop Tutorial: Getting Started"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Today's Bookings" 
          value={isLoading ? "..." : String(todayBookingsCount)} 
          icon={Calendar} 
          trend={todayBookingsCount > 0 ? `${todayBookingsCount} scheduled today` : "No bookings today"}
        />
        <StatsCard 
          title="Active Jobs" 
          value={isLoading ? "..." : String(activeJobsCount)} 
          icon={Briefcase} 
          description={activeJobsCount > 0 ? `${activeJobsCount} jobs in progress` : "No active jobs"}
        />
        <StatsCard 
          title="Revenue (Today)" 
          value={isLoading ? "..." : `$${todayRevenue.toFixed(2)}`} 
          icon={FileText} 
          trend={todayRevenue > 0 ? `From ${todayBookingsCount} bookings` : "No revenue today"}
        />
        <StatsCard 
          title="Low Stock Items" 
          value={isLoading ? "..." : String(lowStockItems)} 
          icon={Package} 
          description={lowStockItems > 0 ? `${lowStockItems} items below minimum` : "All items in stock"}
        />
      </div>

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
                      {!user ? (
                        <div className="p-6 text-center">
                          <p className="text-muted-foreground">Sign in to view your upcoming appointments</p>
                        </div>
                      ) : isLoading ? (
                        <div className="p-6 text-center">
                          <p className="text-muted-foreground">Loading appointments...</p>
                        </div>
                      ) : formattedAppointments.length > 0 ? (
                        formattedAppointments.map((appointment, i) => (
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
                        ))
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-muted-foreground">No upcoming appointments</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => navigate("/booking-diary")}
                          >
                            Schedule an appointment
                          </Button>
                        </div>
                      )}
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
                        <span className="font-medium">0%</span>
                      </div>
                      <Progress value={0} className="h-2 bg-muted" indicatorClassName="bg-workshop-red" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Job Completion Rate</span>
                        <span className="font-medium">0%</span>
                      </div>
                      <Progress value={0} className="h-2 bg-muted" indicatorClassName="bg-workshop-red" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Customer Satisfaction</span>
                        <span className="font-medium">0%</span>
                      </div>
                      <Progress value={0} className="h-2 bg-muted" indicatorClassName="bg-workshop-red" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Parts Availability</span>
                        <span className="font-medium">0%</span>
                      </div>
                      <Progress value={0} className="h-2 bg-muted" indicatorClassName="bg-workshop-red" />
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
            <Card className="w-full h-full overflow-hidden performance-card">
              <CardHeader className="p-4 pb-2 border-b border-border/50">
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-workshop-red" />
                  Important Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="p-3 bg-workshop-red/10 border border-workshop-red/20 rounded-lg">
                    <p className="text-sm text-workshop-red">
                      Welcome to your workshop dashboard! Start by adding your services, technicians, and service bays.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Set up your workshop profile to customize your experience.
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Create your first booking by navigating to the Booking Diary.
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
              {!user ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">Sign in to view your recent activities</p>
                </div>
              ) : isLoading ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">Loading activities...</p>
                </div>
              ) : appointments.length > 0 ? (
                appointments.map((appointment, i) => (
                  <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-muted/40">
                    <div className="h-8 w-8 rounded-full bg-workshop-red/10 flex items-center justify-center mt-0.5 text-workshop-red">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm">New appointment: {appointment.customer_name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{new Date(appointment.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No recent activities</p>
                </div>
              )}
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
            {!user ? (
              <div className="p-6 text-center">
                <p className="text-muted-foreground">Sign in to view inventory alerts</p>
              </div>
            ) : (
              <>
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No inventory alerts</p>
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
      </div>
    </div>
  );
};

export default Dashboard;
