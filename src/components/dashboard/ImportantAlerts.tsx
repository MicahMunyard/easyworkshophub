
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useImportantAlerts } from "@/hooks/dashboard/useImportantAlerts";

const ImportantAlerts: React.FC = () => {
  const { user } = useAuth();
  const { data: alerts, isLoading } = useImportantAlerts(user?.id);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-workshop-red/10 border-workshop-red/20 text-workshop-red';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/30 text-blue-800 dark:text-blue-200';
    }
  };
  return (
    <Card className="w-full h-full overflow-hidden performance-card">
      <CardHeader className="p-4 pb-2 border-b border-border/50">
        <CardTitle className="flex items-center">
          <AlertCircle className="mr-2 h-5 w-5 text-workshop-red" />
          Important Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground">Loading alerts...</div>
        ) : alerts && alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-3 border rounded-lg flex items-start gap-2 ${getAlertStyles(alert.type)}`}>
                {getAlertIcon(alert.type)}
                <p className="text-sm flex-1">{alert.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-800 dark:text-blue-200 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                No alerts at this time. Your workshop is running smoothly!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportantAlerts;
