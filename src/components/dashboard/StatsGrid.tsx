
import React from "react";
import StatsCard from "./StatsCard";
import { Calendar, Briefcase, FileText, Package } from "lucide-react";

interface StatsGridProps {
  isLoading: boolean;
  todayBookingsCount: number;
  activeJobsCount: number;
  todayRevenue: number;
  lowStockItems: number;
}

const StatsGrid: React.FC<StatsGridProps> = ({
  isLoading,
  todayBookingsCount,
  activeJobsCount,
  todayRevenue,
  lowStockItems
}) => {
  return (
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
        trend={todayRevenue > 0 ? `From completed jobs` : "No revenue today"}
      />
      <StatsCard 
        title="Low Stock Items" 
        value={isLoading ? "..." : String(lowStockItems)} 
        icon={Package} 
        description={lowStockItems > 0 ? `${lowStockItems} items below minimum` : "All items in stock"}
      />
    </div>
  );
};

export default StatsGrid;
