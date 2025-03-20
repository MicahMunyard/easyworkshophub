
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import CommunicationLogList from "./communication/CommunicationLogList";
import AddCommunicationLogForm from "./communication/AddCommunicationLogForm";
import { useCommunicationLog } from "./communication/useCommunicationLog";
import { CommunicationLogProps } from "./communication/types";

const CommunicationLog: React.FC<CommunicationLogProps> = ({ customerId }) => {
  const { 
    logs, 
    isLoading,
    isAddingLog, 
    setIsAddingLog,
    newLog,
    addLog,
    resetForm
  } = useCommunicationLog(customerId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium">Communication History</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAddingLog(true)}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Log Communication</span>
        </Button>
      </div>

      <CommunicationLogList logs={logs} isLoading={isLoading} />

      <AddCommunicationLogForm
        isOpen={isAddingLog}
        onClose={resetForm}
        onSubmit={addLog}
        initialData={newLog}
      />
    </div>
  );
};

export default CommunicationLog;
