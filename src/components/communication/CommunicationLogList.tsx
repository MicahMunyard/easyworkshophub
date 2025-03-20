
import React from "react";
import CommunicationLogEntry from "./CommunicationLogEntry";
import { CommunicationLogEntryType } from "./types";

interface CommunicationLogListProps {
  logs: CommunicationLogEntryType[];
  isLoading: boolean;
}

const CommunicationLogList: React.FC<CommunicationLogListProps> = ({ logs, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <span className="text-sm text-muted-foreground">Loading logs...</span>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No communication logs for this customer
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <CommunicationLogEntry key={log.id} log={log} />
      ))}
    </div>
  );
};

export default CommunicationLogList;
