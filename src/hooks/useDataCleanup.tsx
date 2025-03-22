
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Define a type for our table names to ensure type safety
export type TableName = 
  | "user_bookings"
  | "user_jobs"
  | "user_inventory_items"
  | "service_bays"
  | "technicians"
  | "services"
  | "service_reminders";

// Define which tables have user_id columns
const tablesWithUserId: TableName[] = [
  'user_bookings',
  'user_jobs',
  'user_inventory_items'
];

// Define tables that should be completely cleared for the current user
const tablesToTruncate: TableName[] = [
  'service_bays',
  'technicians',
  'services',
  'service_reminders'
];

export type CleanupResult = { 
  table: string; 
  deleted: number 
};

export const useDataCleanup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CleanupResult[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const cleanupData = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to clear data",
        variant: "destructive",
      });
      return { success: false, results: [] };
    }

    setIsLoading(true);
    setResults([]);
    let successCount = 0;
    let errorCount = 0;
    const cleanupResults: CleanupResult[] = [];

    try {
      // First handle tables that have user_id column
      for (const table of tablesWithUserId) {
        try {
          // First, count how many records will be deleted
          const { count, error: countError } = await supabase
            .from(table as any)
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          
          if (countError) {
            console.error(`Error counting ${table}:`, countError);
            cleanupResults.push({ table, deleted: 0 });
            errorCount++;
            continue;
          }
          
          // TypeScript workaround: use type assertion to any to avoid deep instantiation error
          const { error } = await supabase
            .from(table as any)
            .delete()
            .eq('user_id', user.id);
          
          if (error) {
            console.error(`Error cleaning ${table}:`, error);
            cleanupResults.push({ table, deleted: 0 });
            errorCount++;
          } else {
            cleanupResults.push({ table, deleted: count || 0 });
            successCount++;
          }
        } catch (err) {
          console.error(`Error cleaning ${table}:`, err);
          cleanupResults.push({ table, deleted: 0 });
          errorCount++;
        }
      }

      // Then handle tables that need to be truncated for this user
      for (const table of tablesToTruncate) {
        try {
          // First, count how many records will be deleted
          const { count, error: countError } = await supabase
            .from(table as any)
            .select('*', { count: 'exact', head: true });
          
          if (countError) {
            console.error(`Error counting ${table}:`, countError);
            cleanupResults.push({ table, deleted: 0 });
            errorCount++;
            continue;
          }
          
          // Delete all records in the table using a direct delete without the problematic condition
          const { error } = await supabase
            .from(table as any)
            .delete()
            .gte('id', '00000000-0000-0000-0000-000000000000'); // This will match all valid UUIDs
          
          if (error) {
            console.error(`Error cleaning ${table}:`, error);
            cleanupResults.push({ table, deleted: 0 });
            errorCount++;
          } else {
            cleanupResults.push({ table, deleted: count || 0 });
            successCount++;
          }
        } catch (err) {
          console.error(`Error cleaning ${table}:`, err);
          cleanupResults.push({ table, deleted: 0 });
          errorCount++;
        }
      }

      setResults(cleanupResults);

      if (errorCount === 0) {
        toast({
          title: "Data cleanup complete",
          description: `Successfully cleared data from ${successCount} tables`,
          variant: "default",
        });
        return { success: true, results: cleanupResults };
      } else {
        toast({
          title: "Partial data cleanup",
          description: `Cleared ${successCount} tables, failed to clear ${errorCount} tables`,
          variant: "destructive",
        });
        return { success: false, results: cleanupResults };
      }
    } catch (error) {
      console.error("Error in cleanup process:", error);
      toast({
        title: "Cleanup failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { success: false, results: cleanupResults };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cleanupData,
    isLoading,
    results,
    hasUser: !!user
  };
};
