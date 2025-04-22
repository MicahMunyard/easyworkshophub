import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type SocialPlatform = 'facebook' | 'instagram' | 'tiktok';

export const connectSocialPlatform = async (
  userId: string,
  platform: SocialPlatform
): Promise<boolean> => {
  try {
    // For Facebook, the connection is handled by the useFacebookAuth hook
    if (platform === 'facebook') {
      // Just return true since the actual connection is handled elsewhere
      return true;
    }
    
    // For other platforms, we'll keep the demo functionality for now
    console.log(`Initiating ${platform} connection for user ${userId}`);
    
    // For demonstration purposes, we'll simulate the connection process
    toast({
      title: "Connection Initiated",
      description: `Connecting to ${platform}...`,
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a sample conversation to demonstrate functionality
    const { error } = await supabase
      .from('social_conversations')
      .insert({
        user_id: userId,
        platform: platform,
        contact_name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Demo Contact`,
        contact_handle: `demo_${platform}_user`,
        profile_picture_url: `https://randomuser.me/api/portraits/${platform === 'instagram' ? 'women' : 'men'}/${Math.floor(Math.random() * 100)}.jpg`,
        last_message_at: new Date().toISOString(),
        unread: true,
        created_at: new Date().toISOString(),
        external_id: `${platform}-${Date.now()}`
      });
      
    if (error) {
      throw error;
    }
    
    toast({
      title: "Connection Successful",
      description: `You are now connected to ${platform}`,
    });
    
    return true;
  } catch (error) {
    console.error(`Error connecting to ${platform}:`, error);
    toast({
      variant: "destructive",
      title: "Connection Failed",
      description: `There was a problem connecting to ${platform}. Please try again.`
    });
    
    return false;
  }
};
