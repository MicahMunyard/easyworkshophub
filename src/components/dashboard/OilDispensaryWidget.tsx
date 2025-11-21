import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOilDispensaryData } from "@/hooks/dashboard/useOilDispensaryData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, Droplet, Clock } from "lucide-react";
import benchImage from "@/assets/oil-bench.png";
import { formatDistanceToNow } from "date-fns";

const OilDispensaryWidget: React.FC = () => {
  const { benchId, sensors, isLoading, error, lastUpdated } = useOilDispensaryData();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !benchId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5" />
            Oil Dispensary Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>{error || "Configure your bench ID in settings to view oil levels"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderSensorGraph = (sensor: typeof sensors.sensor1, position: "left" | "right" | "top") => {
    if (!sensor) return null;

    const graphData = [
      { name: "Empty", value: 0 },
      { name: "Current", value: sensor.current_level },
      { name: "Capacity", value: sensor.capacity },
    ];

    const getColor = () => {
      if (sensor.percentage > 50) return "hsl(var(--chart-2))";
      if (sensor.percentage > 25) return "hsl(var(--chart-3))";
      return "hsl(var(--chart-1))";
    };

    return (
      <div className={`flex flex-col ${position === "top" ? "items-center mb-4" : ""}`}>
        <div className="text-sm font-medium mb-2">{sensor.oil_type}</div>
        <div className={`${position === "top" ? "w-48" : "w-full"} h-32`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" hide />
              <YAxis domain={[0, sensor.capacity]} hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={getColor()}
                fill={getColor()}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-2 space-y-1">
          <div className="text-lg font-bold" style={{ color: getColor() }}>
            {sensor.percentage}%
          </div>
          <div className="text-xs text-muted-foreground">
            {sensor.current_level.toFixed(1)}L / {sensor.capacity}L
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="h-5 w-5" />
            Oil Dispensary - {benchId}
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-1 text-sm font-normal text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Sensor 3 - Top Center */}
          {sensors.sensor3 && (
            <div className="flex justify-center">
              {renderSensorGraph(sensors.sensor3, "top")}
            </div>
          )}

          {/* Main Layout: Sensor 1 - Bench Image - Sensor 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Sensor 1 - Left */}
            <div className="order-1">
              {sensors.sensor1 ? (
                renderSensorGraph(sensors.sensor1, "left")
              ) : (
                <div className="text-center text-muted-foreground text-sm">No data</div>
              )}
            </div>

            {/* Bench Image - Center */}
            <div className="order-2 flex justify-center">
              <img
                src={benchImage}
                alt="Oil Dispensary Bench"
                className="max-w-full h-auto max-h-48 object-contain"
              />
            </div>

            {/* Sensor 2 - Right */}
            <div className="order-3">
              {sensors.sensor2 ? (
                renderSensorGraph(sensors.sensor2, "right")
              ) : (
                <div className="text-center text-muted-foreground text-sm">No data</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OilDispensaryWidget;
