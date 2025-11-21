import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOilDispensaryData } from "@/hooks/dashboard/useOilDispensaryData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, Droplet, Clock, Unplug } from "lucide-react";
import benchImage from "@/assets/oil-bench.png";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const OilDispensaryWidget: React.FC = () => {
  const { benchId, sensors, isLoading, error, lastUpdated } = useOilDispensaryData();
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const queryClient = useQueryClient();

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ oil_bench_id: null })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Oil bench disconnected successfully");
      queryClient.invalidateQueries({ queryKey: ["oil-dispensary-data"] });
      setShowDisconnectDialog(false);
    } catch (error) {
      console.error("Error disconnecting bench:", error);
      toast.error("Failed to disconnect oil bench");
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
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
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!benchId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5" />
            Oil Dispensary Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">Configure your bench ID in settings to view oil levels</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/settings?tab=oil-bench'}
            >
              Go to Settings
            </Button>
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
      <div className={`flex flex-col ${position === "top" ? "items-center mb-6" : ""}`}>
        <div className="text-lg font-semibold mb-3">{sensor.oil_type}</div>
        <div className={`${position === "top" ? "w-64" : "w-full"} h-64`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" hide />
              <YAxis domain={[0, sensor.capacity]} hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  padding: "12px",
                }}
                labelStyle={{ fontSize: "14px", fontWeight: "600" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={getColor()}
                fill={getColor()}
                fillOpacity={0.7}
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-4 space-y-2">
          <div className="text-3xl font-bold" style={{ color: getColor() }}>
            {sensor.percentage}%
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {sensor.current_level.toFixed(1)}L / {sensor.capacity}L
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="min-h-[700px] shadow-lg border-2">
      <CardHeader className="pb-8">
        <CardTitle className="flex items-center justify-between text-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Droplet className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div>Oil Dispensary Monitor</div>
              <div className="text-sm font-normal text-muted-foreground mt-1">
                Bench ID: {benchId}
              </div>
            </div>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-2 text-base font-normal text-muted-foreground">
              <Clock className="h-5 w-5" />
              Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-8">
        <div className="space-y-10">
          {/* Sensor 3 - Top Center */}
          {sensors.sensor3 && (
            <div className="flex justify-center pt-4">
              {renderSensorGraph(sensors.sensor3, "top")}
            </div>
          )}

          {/* Main Layout: Sensor 1 - Bench Image - Sensor 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center px-4">
            {/* Sensor 1 - Left */}
            <div className="order-1">
              {sensors.sensor1 ? (
                renderSensorGraph(sensors.sensor1, "left")
              ) : (
                <div className="text-center text-muted-foreground">No data available</div>
              )}
            </div>

            {/* Bench Image - Center */}
            <div className="order-2 flex flex-col items-center gap-4">
              <img
                src={benchImage}
                alt="Oil Dispensary Bench"
                className="max-w-full h-auto max-h-96 object-contain drop-shadow-2xl"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDisconnectDialog(true)}
                className="flex items-center gap-2 text-muted-foreground hover:text-destructive hover:border-destructive"
              >
                <Unplug className="h-4 w-4" />
                Disconnect Bench
              </Button>
            </div>

            {/* Sensor 2 - Right */}
            <div className="order-3">
              {sensors.sensor2 ? (
                renderSensorGraph(sensors.sensor2, "right")
              ) : (
                <div className="text-center text-muted-foreground">No data available</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Oil Bench?</AlertDialogTitle>
            <AlertDialogDescription>
              This will unlink bench ID "{benchId}" from your account. You can reconnect it later from settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                "Disconnect"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default OilDispensaryWidget;
