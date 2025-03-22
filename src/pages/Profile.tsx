
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, User, LogOut } from "lucide-react";
import DataCleanupTool from "@/components/DataCleanupTool";

const Profile = () => {
  const { user, profile, signOut, updateProfile, loading } = useAuth();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      full_name: profile?.full_name || "",
      workshop_name: profile?.workshop_name || "",
      phone_number: profile?.phone_number || "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await updateProfile(data);
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
    : user?.email?.substring(0, 2).toUpperCase() || "U";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <h1 className="text-2xl font-bold">Please Sign In</h1>
        <p className="text-muted-foreground">You need to sign in to view your profile</p>
        <Button onClick={() => window.location.href = "/auth/signin"}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and workshop settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
          <DataCleanupTool />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
            <CardDescription>Your account information and details</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="text-2xl bg-primary/10">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="font-medium text-lg">
                {profile?.full_name || "Workshop User"}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="w-full px-4 py-3 rounded-lg bg-muted/50">
              <div className="text-sm font-medium mb-1">Account Info</div>
              <div className="text-xs text-muted-foreground">
                Email: {user.email}
                <br />
                Account created:{" "}
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal and workshop details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Your Name</Label>
                <Input
                  id="full_name"
                  {...register("full_name", {
                    required: "Name is required",
                  })}
                  placeholder="Your full name"
                  className={errors.full_name ? "border-destructive" : ""}
                />
                {errors.full_name && (
                  <p className="text-xs text-destructive">
                    {errors.full_name.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="workshop_name">Workshop Name</Label>
                <Input
                  id="workshop_name"
                  {...register("workshop_name")}
                  placeholder="Your workshop or business name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  {...register("phone_number")}
                  placeholder="Contact phone number"
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
