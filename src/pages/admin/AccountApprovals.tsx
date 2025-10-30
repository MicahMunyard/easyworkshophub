import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, User } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface PendingProfile {
  user_id: string;
  full_name: string;
  workshop_name: string;
  username: string;
  created_at: string;
  account_status: string;
  approval_notes: string | null;
}

export default function AccountApprovals() {
  const queryClient = useQueryClient();
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["pending-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("account_status", ["pending_approval", "rejected"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PendingProfile[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      userId,
      status,
      notes,
    }: {
      userId: string;
      status: string;
      notes?: string;
    }) => {
      const { error } = await supabase.rpc("update_account_status", {
        _profile_user_id: userId,
        _status: status,
        _notes: notes || null,
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pending-accounts"] });
      toast.success(
        variables.status === "approved"
          ? "Account approved successfully"
          : "Account rejected"
      );
      setSelectedProfile(null);
      setNotes("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update account status");
    },
  });

  const handleApprove = (userId: string) => {
    updateStatusMutation.mutate({
      userId,
      status: "approved",
      notes: notes || undefined,
    });
  };

  const handleReject = (userId: string) => {
    if (!notes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    updateStatusMutation.mutate({
      userId,
      status: "rejected",
      notes,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const pendingCount = profiles?.filter((p) => p.account_status === "pending_approval").length || 0;
  const rejectedCount = profiles?.filter((p) => p.account_status === "rejected").length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Account Approvals</h1>
          <p className="text-muted-foreground mt-2">
            Review and approve new workshop account requests
          </p>
        </div>
        <div className="flex gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{rejectedCount}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4">
        {profiles?.map((profile) => (
          <Card key={profile.user_id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {profile.full_name}
                  </CardTitle>
                  <CardDescription>
                    {profile.workshop_name && (
                      <span className="block">Workshop: {profile.workshop_name}</span>
                    )}
                    <span className="block">Username: {profile.username}</span>
                    <span className="block text-xs">
                      Requested: {format(new Date(profile.created_at), "PPpp")}
                    </span>
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    profile.account_status === "pending_approval"
                      ? "default"
                      : "destructive"
                  }
                >
                  {profile.account_status === "pending_approval"
                    ? "Pending"
                    : "Rejected"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.approval_notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Previous Notes:</p>
                  <p className="text-sm text-muted-foreground">{profile.approval_notes}</p>
                </div>
              )}

              {selectedProfile === profile.user_id ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add notes (optional for approval, required for rejection)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(profile.user_id)}
                      disabled={updateStatusMutation.isPending}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(profile.user_id)}
                      disabled={updateStatusMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedProfile(null);
                        setNotes("");
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setSelectedProfile(profile.user_id)}
                  variant="outline"
                  className="w-full"
                >
                  Review Account
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {profiles?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No pending accounts</p>
              <p className="text-sm text-muted-foreground">
                All account requests have been reviewed
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
