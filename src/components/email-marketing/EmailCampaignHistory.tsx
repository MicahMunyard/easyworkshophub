
import React from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmailCampaignHistoryProps } from "./types";
import { format } from "date-fns";
import { CalendarIcon, Clock, BarChart2, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const EmailCampaignHistory: React.FC<EmailCampaignHistoryProps> = ({ campaigns, isLoading }) => {
  // Function to get the appropriate badge for campaign status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Sent</Badge>;
      case 'sending':
        return <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Sending</Badge>;
      case 'scheduled':
        return <Badge variant="default" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Scheduled</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'failed':
        return <Badge variant="default" className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto bg-muted rounded-full w-12 h-12 flex items-center justify-center mb-4">
          <Send className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg mb-2">No campaigns yet</h3>
        <p className="text-muted-foreground mb-4">
          Your sent and scheduled campaigns will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Recipients</TableHead>
            <TableHead>Sent/Scheduled Date</TableHead>
            <TableHead>Performance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{campaign.name}</div>
                  <div className="text-sm text-muted-foreground">{campaign.subject}</div>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(campaign.status)}</TableCell>
              <TableCell>{campaign.recipient_count || 0}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {campaign.status === 'sent' || campaign.status === 'sending' ? (
                    <>
                      <Send className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      {campaign.sent_at ? formatDate(campaign.sent_at) : "Processing"}
                    </>
                  ) : campaign.status === 'scheduled' ? (
                    <>
                      <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      {campaign.scheduled_for ? formatDate(campaign.scheduled_for) : "Scheduled"}
                    </>
                  ) : (
                    <>
                      <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      Draft
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <BarChart2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  {campaign.status === 'sent' ? (
                    <span>
                      {campaign.open_rate && `${campaign.open_rate}% open rate`}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Not available</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmailCampaignHistory;
