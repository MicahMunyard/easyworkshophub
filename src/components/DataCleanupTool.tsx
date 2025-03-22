
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

const DataCleanupTool = () => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Define tables as an array with explicit type
  const tablesToClean = [
    'user_bookings',
    'user_jobs',
    'user_inventory_items',
    'service_bays',
    'technicians',
    'services',
    'service_reminders'
  ] as const;
  
  // Create a type from the array values
  type TableName = typeof tablesToClean[number];

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
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const table of tablesToClean) {
        try {
          // Use table as a typed parameter
          const { error } = await supabase
            .from(table)
            .delete()
            .eq('user_id', user.id);
          
          if (error) {
            console.error(`Error cleaning ${table}:`, error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`Error cleaning ${table}:`, err);
          errorCount++;
        }
      }

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
      setIsConfirmOpen(false);
    }
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
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DataCleanupTool;
