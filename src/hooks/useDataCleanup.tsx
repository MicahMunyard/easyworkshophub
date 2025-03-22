
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CleanupResult, CleanupResponse } from "./data-cleanup/types";
import { tablesWithUserId, tablesToTruncate } from "./data-cleanup/tables-config";
import { cleanTableWithUserId, cleanTableToTruncate } from "./data-cleanup/cleanup-handlers";

export { CleanupResult };
export type { CleanupResponse };

export const useDataCleanup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CleanupResult[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const cleanupData = async (): Promise<CleanupResponse> => {
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
        const result = await cleanTableWithUserId(table, user.id);
        cleanupResults.push(result);
        
        if (result.deleted > 0) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      // Then handle tables that need to be truncated for this user
      for (const table of tablesToTruncate) {
        const result = await cleanTableToTruncate(table);
        cleanupResults.push(result);
        
        if (result.deleted > 0 || result.deleted === 0 && table !== 'service_reminders') {
          // Count as success if we deleted records or if there were no records to delete
          // (except for service_reminders which we expect to have records)
          successCount++;
        } else {
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
