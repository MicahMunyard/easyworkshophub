
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const ImportantAlerts: React.FC = () => {
  return (
    <Card className="w-full h-full overflow-hidden performance-card">
      <CardHeader className="p-4 pb-2 border-b border-border/50">
        <CardTitle className="flex items-center">
          <AlertCircle className="mr-2 h-5 w-5 text-workshop-red" />
          Important Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="p-3 bg-workshop-red/10 border border-workshop-red/20 rounded-lg">
            <p className="text-sm text-workshop-red">
              Welcome to your workshop dashboard! Start by adding your services, technicians, and service bays.
            </p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Set up your workshop profile to customize your experience.
            </p>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Create your first booking by navigating to the Booking Diary.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportantAlerts;
