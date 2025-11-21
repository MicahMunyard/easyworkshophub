import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const OilBenchConfig: React.FC = () => {
  const { user } = useAuth();
  const [benchId, setBenchId] = useState("");
  const [currentBenchId, setCurrentBenchId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [lastDataReceived, setLastDataReceived] = useState<Date | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchCurrentBenchId = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("oil_bench_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data?.oil_bench_id) {
          setCurrentBenchId(data.oil_bench_id);
          setBenchId(data.oil_bench_id);

          // Check for latest data
          const { data: oilData } = await supabase
            .from("oil_dispensary_data")
            .select("timestamp")
            .eq("bench_id", data.oil_bench_id)
            .order("timestamp", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (oilData?.timestamp) {
            setLastDataReceived(new Date(oilData.timestamp));
          }
        }
      } catch (err) {
        console.error("Error fetching bench config:", err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchCurrentBenchId();
  }, [user]);

  const handleSave = async () => {
    if (!user || !benchId.trim()) {
      toast.error("Please enter a bench ID");
      return;
    }

    setIsLoading(true);
    try {
      // Validate that bench_id exists in oil_dispensary_data
      const { data: existingData, error: checkError } = await supabase
        .from("oil_dispensary_data")
        .select("bench_id")
        .eq("bench_id", benchId.trim())
        .limit(1)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        throw new Error("Error validating bench ID");
      }

      if (!existingData) {
        toast.error("Bench ID not found. Please check your bench ID and try again.");
        setIsLoading(false);
        return;
      }

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      let updateError;
      if (existingProfile) {
        // Update existing profile
        const result = await supabase
          .from("profiles")
          .update({ oil_bench_id: benchId.trim() })
          .eq("user_id", user.id);
        updateError = result.error;
      } else {
        // Insert new profile
        const result = await supabase
          .from("profiles")
          .insert({ 
            user_id: user.id, 
            oil_bench_id: benchId.trim(),
            account_status: 'approved',
            onboarding_completed: true
          });
        updateError = result.error;
      }

      if (updateError) throw updateError;

      // Link existing oil_dispensary_data to this user
      const { error: linkError } = await supabase
        .from("oil_dispensary_data")
        .update({ user_id: user.id, processed: true })
        .eq("bench_id", benchId.trim())
        .is("user_id", null);

      if (linkError) console.error("Error linking existing data:", linkError);

      setCurrentBenchId(benchId.trim());
      toast.success("Bench ID saved successfully!");
    } catch (err) {
      console.error("Error saving bench config:", err);
      toast.error("Failed to save bench ID");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Oil Dispensary Bench Configuration</CardTitle>
        <CardDescription>
          Connect your workshop to your oil dispensary bench by entering your bench ID
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bench-id">Bench ID</Label>
          <Input
            id="bench-id"
            value={benchId}
            onChange={(e) => setBenchId(e.target.value)}
            placeholder="Enter your bench ID"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            This is the unique identifier for your oil dispensary bench
          </p>
        </div>

        {currentBenchId && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">
              Currently connected to: <span className="font-medium text-foreground">{currentBenchId}</span>
            </span>
          </div>
        )}

        {lastDataReceived && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">
              Last data received: {lastDataReceived.toLocaleString()}
            </span>
          </div>
        )}

        {!currentBenchId && !lastDataReceived && (
          <div className="flex items-center gap-2 text-sm">
            <XCircle className="h-4 w-4 text-orange-500" />
            <span className="text-muted-foreground">No bench connected yet</span>
          </div>
        )}

        <Button onClick={handleSave} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save & Connect"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default OilBenchConfig;
