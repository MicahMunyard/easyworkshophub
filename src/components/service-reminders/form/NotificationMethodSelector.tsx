
import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface NotificationMethodSelectorProps {
  notificationMethods: string[];
  setNotificationMethods: (methods: string[]) => void;
}

const NotificationMethodSelector: React.FC<NotificationMethodSelectorProps> = ({
  notificationMethods,
  setNotificationMethods
}) => {
  const toggleMethod = (method: string, checked: boolean) => {
    if (checked) {
      setNotificationMethods([...notificationMethods, method]);
    } else {
      setNotificationMethods(notificationMethods.filter(m => m !== method));
    }
  };

  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label className="text-right pt-0">
        Notification Method
      </Label>
      <div className="flex flex-col gap-2 col-span-3">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="notify-email" 
            checked={notificationMethods.includes('email')}
            onCheckedChange={(checked) => toggleMethod('email', checked as boolean)}
          />
          <Label htmlFor="notify-email" className="font-normal">Email</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="notify-sms" 
            checked={notificationMethods.includes('sms')}
            onCheckedChange={(checked) => toggleMethod('sms', checked as boolean)}
          />
          <Label htmlFor="notify-sms" className="font-normal">SMS</Label>
        </div>
      </div>
    </div>
  );
};

export default NotificationMethodSelector;
