import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  updated_at: string;
  updated_by: string | null;
}

export const useSystemSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*");

      if (error) throw error;
      return data as SystemSetting[];
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({
      key,
      value,
    }: {
      key: string;
      value: any;
    }) => {
      const { error } = await supabase
        .from("system_settings")
        .update({
          setting_value: value,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("setting_key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      toast({
        title: "Setting updated",
        description: "System setting has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating setting",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const requireAccountApproval = settings?.find(
    (s) => s.setting_key === "require_account_approval"
  )?.setting_value?.enabled ?? true;

  return {
    settings,
    isLoading,
    requireAccountApproval,
    updateSetting: updateSetting.mutate,
    isUpdating: updateSetting.isPending,
  };
};
