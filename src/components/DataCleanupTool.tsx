
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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

// Define a type for our table names to ensure type safety
type TableName = 
  | "user_bookings"
  | "user_jobs"
  | "user_inventory_items"
  | "service_bays"
  | "technicians"
  | "services"
  | "service_reminders";

const DataCleanupTool = () => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ table: string; deleted: number }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Define tables to clean up with proper typing
  const tablesToClean: TableName[] = [
    'user_bookings',
    'user_jobs',
    'user_inventory_items',
    'service_bays',
    'technicians',
    'services',
    'service_reminders'
  ];

  const handleCleanupData = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to clear data",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResults([]);
    let successCount = 0;
    let errorCount = 0;
    const cleanupResults: { table: string; deleted: number }[] = [];

    try {
      for (const table of tablesToClean) {
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

      setResults(cleanupResults);
      setShowResults(true);

      if (errorCount === 0) {
        toast({
          title: "Data cleanup complete",
          description: `Successfully cleared data from ${successCount} tables`,
          variant: "default",
        });
      } else {
        toast({
          title: "Partial data cleanup",
          description: `Cleared ${successCount} tables, failed to clear ${errorCount} tables`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in cleanup process:", error);
      toast({
        title: "Cleanup failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Don't close the dialog if we're showing results
      if (!showResults) {
        setIsConfirmOpen(false);
      }
    }
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setIsConfirmOpen(false);
  };

  if (!user) return null;

  return (
    <>
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => setIsConfirmOpen(true)}
        className="gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Clear My Data
      </Button>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          {!showResults ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Clear All Your Data?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all your workshop data including bookings, jobs, inventory items, and settings.
                  This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleCleanupData();
                  }}
                  disabled={isLoading}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Yes, Clear My Data
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Data Cleanup Results
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Here's what was deleted from your account:
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Table</th>
                      <th className="text-right py-2">Records Deleted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index} className="border-b border-muted">
                        <td className="py-2">{result.table}</td>
                        <td className="text-right py-2">{result.deleted}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AlertDialogFooter>
                <Button onClick={handleCloseResults}>
                  Close
                </Button>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DataCleanupTool;
