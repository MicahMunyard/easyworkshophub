
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

interface StatsCardProps { 
  title: string; 
  value: string; 
  icon: React.ElementType;
  trend?: string;
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, description }) => (
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

export default StatsCard;
