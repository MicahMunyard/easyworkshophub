
import React from "react";
import { 
  Gauge, 
  TrendingUp, 
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/contexts/AuthContext";

// Import dashboard components
import StatsGrid from "./dashboard/StatsGrid";
import VideoCarousel from "./dashboard/VideoCarousel";
import AppointmentsList from "./dashboard/AppointmentsList";
import WorkshopStats from "./dashboard/WorkshopStats";
import ImportantAlerts from "./dashboard/ImportantAlerts";
import RecentActivities from "./dashboard/RecentActivities";
import InventoryAlerts from "./dashboard/InventoryAlerts";

// Sample video data
const DASHBOARD_VIDEOS = [
  {
    id: "BHGh0rVxTbo",
    title: "Workshop Tutorial: Getting Started",
  },
  {
    id: "NpEaa2P7qZI",
    title: "How to Manage Workshop Inventory",
  },
  {
    id: "M9AoEJA9L0w",
    title: "Customer Management & Service Excellence",
  }
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    appointments,
    todayBookingsCount,
    activeJobsCount,
    todayRevenue,
    lowStockItems,
    isLoading,
    formattedAppointments
  } = useDashboardData();

  return (
    <div className="space-y-4 md:space-y-6">
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

      <div className="w-full h-[170px] md:h-[180px]">
        <VideoCarousel videos={DASHBOARD_VIDEOS} />
      </div>

      <StatsGrid 
        isLoading={isLoading}
        todayBookingsCount={todayBookingsCount}
        activeJobsCount={activeJobsCount}
        todayRevenue={todayRevenue}
        lowStockItems={lowStockItems}
      />

      <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
        <ResizablePanel defaultSize={65}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={60}>
              <div className="flex h-full items-center justify-center p-4">
                <AppointmentsList 
                  user={user}
                  isLoading={isLoading}
                  appointments={formattedAppointments}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40}>
              <div className="flex h-full items-center justify-center p-4">
                <WorkshopStats />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={35}>
          <div className="flex h-full items-center justify-center p-4">
            <ImportantAlerts />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <div className="grid gap-4 md:grid-cols-12">
        <RecentActivities 
          user={user}
          isLoading={isLoading}
          appointments={appointments}
        />
        <InventoryAlerts user={user} />
      </div>
    </div>
  );
};

export default Dashboard;
