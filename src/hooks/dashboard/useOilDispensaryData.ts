import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SensorData {
  oil_type: string;
  current_level: number;
  capacity: number;
  percentage: number;
  timestamp: string;
}

interface OilDispensaryData {
  benchId: string | null;
  sensors: {
    sensor1: SensorData | null;
    sensor2: SensorData | null;
    sensor3: SensorData | null;
  };
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useOilDispensaryData = (): OilDispensaryData => {
  const { user } = useAuth();
  const [data, setData] = useState<OilDispensaryData>({
    benchId: null,
    sensors: {
      sensor1: null,
      sensor2: null,
      sensor3: null,
    },
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  useEffect(() => {
    if (!user) {
      setData(prev => ({ ...prev, isLoading: false, error: "User not authenticated" }));
      return;
    }

    const fetchData = async () => {
      try {
        // Get user's bench_id from profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("oil_bench_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setData(prev => ({ 
            ...prev, 
            isLoading: false, 
            benchId: null,
            error: "Error loading profile. Please try refreshing the page." 
          }));
          return;
        }

        if (!profile || !profile.oil_bench_id) {
          setData(prev => ({ 
            ...prev, 
            isLoading: false, 
            benchId: null,
            error: null
          }));
          return;
        }

        // Fetch latest data for each sensor
        const { data: oilData, error: oilError } = await supabase
          .from("oil_dispensary_data")
          .select("*")
          .eq("user_id", user.id)
          .eq("bench_id", profile.oil_bench_id)
          .order("timestamp", { ascending: false })
          .limit(10);

        if (oilError) throw oilError;

        if (!oilData || oilData.length === 0) {
          setData(prev => ({
            ...prev,
            isLoading: false,
            benchId: profile.oil_bench_id,
            error: "No data available yet",
          }));
          return;
        }

        // Group by sensor (extract sensor number from oil_type)
        const sensorMap: { [key: string]: SensorData } = {};
        let latestTimestamp: Date | null = null;

        oilData.forEach((record) => {
          const sensorMatch = record.oil_type?.match(/Sensor (\d+)/);
          const sensorNum = sensorMatch ? sensorMatch[1] : "1";
          const sensorKey = `sensor${sensorNum}`;

          if (!sensorMap[sensorKey]) {
            // Extract capacity from raw_payload if not in main columns
            const rawPayload = record.raw_payload as any;
            const capacity = record.capacity || rawPayload?.sensor?.capacity || 208;
            const currentLevel = record.current_level || 0;
            const percentage = capacity > 0 ? (currentLevel / capacity) * 100 : 0;

            sensorMap[sensorKey] = {
              oil_type: record.oil_type || "Unknown Oil",
              current_level: currentLevel,
              capacity: capacity,
              percentage: Math.round(percentage),
              timestamp: record.timestamp || record.created_at,
            };

            const recordTime = new Date(record.timestamp || record.created_at);
            if (!latestTimestamp || recordTime > latestTimestamp) {
              latestTimestamp = recordTime;
            }
          }
        });

        setData({
          benchId: profile.oil_bench_id,
          sensors: {
            sensor1: sensorMap.sensor1 || null,
            sensor2: sensorMap.sensor2 || null,
            sensor3: sensorMap.sensor3 || null,
          },
          isLoading: false,
          error: null,
          lastUpdated: latestTimestamp,
        });
      } catch (err) {
        console.error("Error fetching oil dispensary data:", err);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Unknown error",
        }));
      }
    };

    fetchData();

    // Set up real-time subscription
    const channel = supabase
      .channel("oil-dispensary-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "oil_dispensary_data",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return data;
};
