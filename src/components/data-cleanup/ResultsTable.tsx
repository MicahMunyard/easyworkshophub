
import React from "react";
import { CleanupResult } from "@/hooks/useDataCleanup";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import {
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

interface ResultsTableProps {
  results: CleanupResult[];
  onClose: () => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results, onClose }) => {
  return (
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
        <Button onClick={onClose}>
          Close
        </Button>
      </AlertDialogFooter>
    </>
  );
};

export default ResultsTable;
