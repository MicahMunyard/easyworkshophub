import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Shield } from "lucide-react";

export const SystemSettings = () => {
  const { requireAccountApproval, updateSetting, isUpdating } = useSystemSettings();

  const handleToggleApproval = (enabled: boolean) => {
    updateSetting({
      key: "require_account_approval",
      value: { enabled },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          System Settings
        </CardTitle>
        <CardDescription>
          Configure system-wide settings and permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="approval-required" className="text-base font-medium">
              Require Account Approval
            </Label>
            <p className="text-sm text-muted-foreground">
              When enabled, new user accounts must be manually approved by an admin before they can access the system.
              When disabled, new users can sign up and immediately access the system.
            </p>
          </div>
          <Switch
            id="approval-required"
            checked={requireAccountApproval}
            onCheckedChange={handleToggleApproval}
            disabled={isUpdating}
          />
        </div>
      </CardContent>
    </Card>
  );
};
