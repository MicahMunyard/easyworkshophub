
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MessageSquare, ArrowUpRight, ArrowDownLeft, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { CommunicationLogEntryType } from "./types";

interface CommunicationLogEntryProps {
  log: CommunicationLogEntryType;
}

const CommunicationLogEntry: React.FC<CommunicationLogEntryProps> = ({ log }) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'outbound' 
      ? <ArrowUpRight className="h-4 w-4 text-blue-500" /> 
      : <ArrowDownLeft className="h-4 w-4 text-green-500" />;
  };

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="bg-muted rounded-full p-2">
                {getTypeIcon(log.type)}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <strong className="text-sm capitalize">{log.type}</strong>
                  {getDirectionIcon(log.direction)}
                  <span className="text-xs text-muted-foreground capitalize">
                    {log.direction}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(log.timestamp)}</span>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{log.staff_member || 'Unknown'}</span>
              {log.duration && (
                <>
                  <span className="mx-1">•</span>
                  <span>{log.duration} sec</span>
                </>
              )}
            </div>
          </div>
          
          {log.content && (
            <div className="text-sm mt-1 border-t pt-2 whitespace-pre-wrap">
              {log.content}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunicationLogEntry;
