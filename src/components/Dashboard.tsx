import React from "react";
import { 
  Gauge, 
  TrendingUp, 
  Clock,
  Video as VideoIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/contexts/AuthContext";
import { useOilDispensaryData } from "@/hooks/dashboard/useOilDispensaryData";
import { TierGate } from "./tier/TierGate";

// Import dashboard components
import StatsGrid from "./dashboard/StatsGrid";
import VideoCarousel from "./dashboard/VideoCarousel";
import AppointmentsList from "./dashboard/AppointmentsList";
import WorkshopStats from "./dashboard/WorkshopStats";
import ImportantAlerts from "./dashboard/ImportantAlerts";
import RecentActivities from "./dashboard/RecentActivities";
import InventoryAlerts from "./dashboard/InventoryAlerts";
import LowStockBulkWidget from "./dashboard/LowStockBulkWidget";
import OilDispensaryWidget from "./dashboard/OilDispensaryWidget";

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
  const { benchId } = useOilDispensaryData();

  return (
    <div className="w-full space-y-4 md:space-y-6">
      {/* Main title moved to the left with an icon */}
      <div className="flex items-center gap-2">
        <VideoIcon className="mr-1 h-6 w-6 text-workshop-red" />
        <h1 className="text-3xl font-bold tracking-tight">
          What's New At WorkshopBase?
        </h1>
      </div>
      
      {/* Video carousel with increased height to prevent overlap */}
      <div className="w-full h-[380px] md:h-[380px]">
        <VideoCarousel videos={DASHBOARD_VIDEOS} />
      </div>
      
      {/* Dashboard header moved below the video */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center">
            <Gauge className="mr-2 h-6 w-6 text-workshop-red" /> 
            Dashboard
          </h2>
          <p className="text-muted-foreground">
            Workshop overview and performance metrics.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9">
            <Clock className="h-4 w-4 mr-2" /> Last 30 days
          </Button>
          <TierGate featureKey="reports" fallback="hide">
            <Button 
              className="h-9 bg-workshop-red hover:bg-workshop-red/90"
              onClick={() => navigate("/reports")}
            >
              <TrendingUp className="h-4 w-4 mr-2" /> View Reports
            </Button>
          </TierGate>
        </div>
      </div>

      <StatsGrid 
        isLoading={isLoading}
        todayBookingsCount={todayBookingsCount}
        activeJobsCount={activeJobsCount}
        todayRevenue={todayRevenue}
        lowStockItems={lowStockItems}
      />

      {/* Oil Dispensary Widget - Featured prominently if configured */}
      {benchId && (
        <div className="w-full">
          <OilDispensaryWidget />
        </div>
      )}

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
                <TierGate 
                  featureKey="reports" 
                  fallback="blur"
                  upgradeMessage="Upgrade to Full Access to view workshop performance statistics"
                >
                  <WorkshopStats />
                </TierGate>
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
        <TierGate featureKey="reports" fallback="blur">
          <div className="md:col-span-5">
            <RecentActivities 
              user={user}
              isLoading={isLoading}
              appointments={appointments}
            />
          </div>
        </TierGate>
        <TierGate featureKey="inventory" fallback="blur">
          <div className="md:col-span-3">
            <InventoryAlerts user={user} />
          </div>
        </TierGate>
        <TierGate featureKey="inventory" fallback="blur">
          <div className="md:col-span-4">
            <LowStockBulkWidget />
          </div>
        </TierGate>
      </div>
    </div>
  );
};

export default Dashboard;
