
import React from "react";
import { EmailCampaignHistoryProps } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Mail, 
  Calendar, 
  Copy, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock3
} from "lucide-react";
import { format, parseISO } from "date-fns";

const statusColors = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
  scheduled: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
  sent: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
};

const statusIcons = {
  draft: Clock,
  scheduled: Clock3,
  sent: CheckCircle,
  failed: AlertCircle
};

const EmailCampaignHistory: React.FC<EmailCampaignHistoryProps> = ({ campaigns, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading campaigns...</p>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No campaigns found. Create your first campaign.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Recipients</TableHead>
            <TableHead>Performance</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => {
            const StatusIcon = statusIcons[campaign.status];
            
            return (
              <TableRow key={campaign.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {campaign.subject}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={`${statusColors[campaign.status]} capitalize flex items-center gap-1 w-fit`}
                    variant="outline"
                  >
                    <StatusIcon className="h-3 w-3" />
                    {campaign.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {campaign.recipient_count > 0 ? (
                    <span>{campaign.recipient_count} recipients</span>
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </TableCell>
                <TableCell>
                  {campaign.status === 'sent' ? (
                    <div className="space-y-1">
                      <div className="text-xs flex justify-between">
                        <span>Open rate:</span>
                        <span className="font-medium">{(campaign.open_rate || 0) * 100}%</span>
                      </div>
                      <div className="text-xs flex justify-between">
                        <span>Click rate:</span>
                        <span className="font-medium">{(campaign.click_rate || 0) * 100}%</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {campaign.status === 'scheduled' ? (
                    <div className="flex flex-col">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Scheduled for</span>
                      </div>
                      <span>
                        {format(parseISO(campaign.scheduled_for || ''), "MMM d, h:mm a")}
                      </span>
                    </div>
                  ) : campaign.status === 'sent' ? (
                    <div className="flex flex-col">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Sent on</span>
                      </div>
                      <span>
                        {format(parseISO(campaign.sent_at || ''), "MMM d, h:mm a")}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Created on</span>
                      </div>
                      <span>
                        {format(parseISO(campaign.created_at), "MMM d, h:mm a")}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {campaign.status === 'draft' && (
                      <Button variant="outline" size="sm" className="h-8">
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {campaign.status === 'sent' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="View Report"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmailCampaignHistory;
