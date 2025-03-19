
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const profileSchema = z.object({
  full_name: z.string().min(2, { message: 'Full name must be at least 2 characters' }).optional(),
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }).optional(),
  phone_number: z.string().optional(),
  avatar_url: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile: React.FC = () => {
  const { user, profile, updateProfile, loading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      username: '',
      phone_number: '',
      avatar_url: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || '',
        username: profile.username || '',
        phone_number: profile.phone_number || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setIsUpdating(true);
      await updateProfile({
        ...values,
        updated_at: new Date(),
      });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Sign in Required</h2>
        <p className="text-muted-foreground mb-4">
          You need to be signed in to view and update your profile.
        </p>
        <Button onClick={() => window.location.href = '/auth/signin'}>
          Sign In
        </Button>
      </div>
    );
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();
    }
    return user.email?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="mb-8 flex flex-col sm:flex-row items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || user.email || ''} />
          <AvatarFallback className="text-xl bg-workshop-red text-white">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h2 className="text-2xl font-semibold">{profile?.full_name || 'Workshop Owner'}</h2>
          <p className="text-muted-foreground">{user.email}</p>
          {profile?.username && (
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your profile information and contact details.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                placeholder="John Doe"
                {...form.register('full_name')}
              />
              {form.formState.errors.full_name && (
                <p className="text-sm text-red-500">{form.formState.errors.full_name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="johndoe"
                {...form.register('username')}
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact support if you need to update it.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                placeholder="+123456789"
                {...form.register('phone_number')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avatar_url">Profile Picture URL</Label>
              <Input
                id="avatar_url"
                placeholder="https://example.com/avatar.jpg"
                {...form.register('avatar_url')}
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL to your profile picture.
              </p>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
