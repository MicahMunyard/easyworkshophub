
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNotifications } from "@/contexts/NotificationContext";
import { useToast } from "@/hooks/use-toast";

const NotificationSettings = () => {
  const { preferences, updatePreferences } = useNotifications();
  const { toast } = useToast();

  const handleSavePreferences = () => {
    toast({
      title: "Preferences saved",
      description: "Your notification preferences have been updated.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose which notifications you'd like to receive
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="completedJobs" className="text-base">Job Completion Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when jobs are marked as completed by technicians
            </p>
          </div>
          <Switch 
            id="completedJobs" 
            checked={preferences.completedJobs}
            onCheckedChange={(checked) => updatePreferences({ completedJobs: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="assignedJobs" className="text-base">Job Assignment Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when jobs are assigned to technicians
            </p>
          </div>
          <Switch 
            id="assignedJobs" 
            checked={preferences.assignedJobs}
            onCheckedChange={(checked) => updatePreferences({ assignedJobs: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="invoiceDue" className="text-base">Invoice Due Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when invoices are due or overdue
            </p>
          </div>
          <Switch 
            id="invoiceDue" 
            checked={preferences.invoiceDue}
            onCheckedChange={(checked) => updatePreferences({ invoiceDue: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="systemUpdates" className="text-base">System Update Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Get notified about system updates and maintenance
            </p>
          </div>
          <Switch 
            id="systemUpdates" 
            checked={preferences.systemUpdates}
            onCheckedChange={(checked) => updatePreferences({ systemUpdates: checked })}
          />
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={handleSavePreferences}>
          Save Preferences
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationSettings;
