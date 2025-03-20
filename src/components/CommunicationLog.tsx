
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  ArrowUpRight, 
  ArrowDownLeft,
  Clock, 
  User,
  PlusCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface CommunicationLogEntry {
  id: string;
  type: 'phone' | 'email' | 'sms';
  direction: 'inbound' | 'outbound';
  content?: string;
  timestamp: string;
  staff_member?: string;
  duration?: number;
  status?: string;
}

interface CommunicationLogProps {
  customerId: number;
}

const CommunicationLog: React.FC<CommunicationLogProps> = ({ customerId }) => {
  const [logs, setLogs] = useState<CommunicationLogEntry[]>([]);
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [newLog, setNewLog] = useState<Partial<CommunicationLogEntry>>({
    type: 'phone',
    direction: 'outbound',
    content: '',
    duration: undefined,
    staff_member: ''
  });
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, [customerId]);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('customer_id', customerId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error("Error fetching communication logs:", error.message);
      toast({
        variant: "destructive",
        title: "Error fetching logs",
        description: error.message,
      });
    }
  };

  const addLog = async () => {
    try {
      const { error } = await supabase
        .from('communication_logs')
        .insert({
          customer_id: customerId,
          type: newLog.type,
          direction: newLog.direction,
          content: newLog.content?.trim(),
          staff_member: newLog.staff_member?.trim() || profile?.full_name || user?.email || 'Unknown',
          duration: newLog.type === 'phone' ? newLog.duration : null,
          status: newLog.type !== 'phone' ? 'sent' : null
        });

      if (error) throw error;

      resetForm();
      fetchLogs();
      
      toast({
        title: "Log added",
        description: "Communication log has been added successfully",
      });
    } catch (error: any) {
      console.error("Error adding communication log:", error.message);
      toast({
        variant: "destructive",
        title: "Error adding log",
        description: error.message,
      });
    }
  };

  const resetForm = () => {
    setNewLog({
      type: 'phone',
      direction: 'outbound',
      content: '',
      duration: undefined,
      staff_member: profile?.full_name || user?.email || ''
    });
    setIsAddingLog(false);
  };

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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium">Communication History</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAddingLog(true)}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Log Communication</span>
        </Button>
      </div>

      {logs.length > 0 ? (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="hover:shadow-sm transition-shadow">
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
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          No communication logs for this customer
        </div>
      )}

      {/* Add Communication Log Dialog */}
      <Dialog open={isAddingLog} onOpenChange={setIsAddingLog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Log Communication</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comm-type" className="text-right">
                Type
              </Label>
              <Select 
                value={newLog.type} 
                onValueChange={(value) => setNewLog({...newLog, type: value as 'phone' | 'email' | 'sms'})}
              >
                <SelectTrigger id="comm-type" className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="direction" className="text-right">
                Direction
              </Label>
              <Select 
                value={newLog.direction} 
                onValueChange={(value) => setNewLog({...newLog, direction: value as 'inbound' | 'outbound'})}
              >
                <SelectTrigger id="direction" className="col-span-3">
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbound">Inbound (received)</SelectItem>
                  <SelectItem value="outbound">Outbound (sent)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newLog.type === 'phone' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration (sec)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={newLog.duration || ''}
                  onChange={(e) => setNewLog({...newLog, duration: parseInt(e.target.value) || undefined})}
                  className="col-span-3"
                  min="0"
                  step="1"
                />
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="staff" className="text-right">
                Staff Member
              </Label>
              <Input
                id="staff"
                value={newLog.staff_member || ''}
                onChange={(e) => setNewLog({...newLog, staff_member: e.target.value})}
                className="col-span-3"
                placeholder={profile?.full_name || user?.email || 'Enter name'}
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="content" className="text-right pt-2">
                Content
              </Label>
              <Textarea
                id="content"
                value={newLog.content || ''}
                onChange={(e) => setNewLog({...newLog, content: e.target.value})}
                className="col-span-3 min-h-[100px]"
                placeholder={`${newLog.type === 'phone' ? 'Call notes' : 'Message content'}...`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={addLog}>
              Save Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunicationLog;
