
import React, { useState } from "react";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { useDataCleanup } from "@/hooks/useDataCleanup";
import CleanupButton from "./data-cleanup/CleanupButton";
import ConfirmationDialog from "./data-cleanup/ConfirmationDialog";
import ResultsTable from "./data-cleanup/ResultsTable";

const DataCleanupTool: React.FC = () => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { cleanupData, isLoading, results, hasUser } = useDataCleanup();

  const handleCleanupData = async () => {
    const { success } = await cleanupData();
    setShowResults(true);
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setIsConfirmOpen(false);
  };

  if (!hasUser) return null;

  return (
    <>
      <CleanupButton onClick={() => setIsConfirmOpen(true)} />

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          {!showResults ? (
            <ConfirmationDialog 
              isLoading={isLoading} 
              onConfirm={(e) => {
                e.preventDefault();
                handleCleanupData();
              }} 
            />
          ) : (
            <ResultsTable results={results} onClose={handleCloseResults} />
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DataCleanupTool;
