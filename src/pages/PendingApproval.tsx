import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Mail, AlertCircle } from "lucide-react";

export default function PendingApproval() {
  const { signOut, profile } = useAuth();

  const isRejected = profile?.account_status === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {isRejected ? (
            <>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Account Not Approved</CardTitle>
              <CardDescription>
                Your account request was not approved
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
              <CardDescription>
                Your account is being reviewed by our team
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isRejected ? (
            <>
              {profile?.approval_notes && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm font-medium mb-2">Reason:</p>
                  <p className="text-sm text-muted-foreground">{profile.approval_notes}</p>
                </div>
              )}
              <p className="text-center text-sm text-muted-foreground">
                If you believe this was a mistake, please contact our support team.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">What's next?</p>
                  <p className="text-sm text-muted-foreground">
                    We're reviewing your account request. You'll receive an email notification once your account has been approved. This typically takes 1-2 business days.
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Account Details:</p>
                <div className="space-y-1 pl-4">
                  <p>Name: {profile?.full_name}</p>
                  {profile?.workshop_name && <p>Workshop: {profile.workshop_name}</p>}
                  <p>Email: {profile?.username}</p>
                </div>
              </div>
            </>
          )}

          <Button
            onClick={() => signOut()}
            variant="outline"
            className="w-full"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
