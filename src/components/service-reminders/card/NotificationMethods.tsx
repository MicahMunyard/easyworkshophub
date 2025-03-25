
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare } from "lucide-react";

interface NotificationMethodsProps {
  methods: string[] | undefined;
}

const NotificationMethods: React.FC<NotificationMethodsProps> = ({ methods }) => {
  if (!methods || methods.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>Notify via:</span>
      <div className="flex gap-1">
        {methods.includes('email') && (
          <Badge variant="secondary" className="text-xs py-0 h-5">
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Badge>
        )}
        {methods.includes('sms') && (
          <Badge variant="secondary" className="text-xs py-0 h-5">
            <MessageSquare className="h-3 w-3 mr-1" />
            SMS
          </Badge>
        )}
      </div>
    </div>
  );
};

export default NotificationMethods;
