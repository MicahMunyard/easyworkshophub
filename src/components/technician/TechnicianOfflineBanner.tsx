
import React from "react";
import { AlertTriangle } from "lucide-react";

const TechnicianOfflineBanner = () => {
  return (
    <div className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 py-2 px-4">
      <div className="container mx-auto flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <p className="text-sm">You're offline. Changes will be saved and synced when you reconnect.</p>
      </div>
    </div>
  );
};

export default TechnicianOfflineBanner;
