import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export const FacebookConnectionDebug = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Check social_connections
      const { data: connData, error: connError } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'facebook');
      
      console.log('Social connections:', { data: connData, error: connError });
      setConnections(connData || []);

      // Check facebook_page_tokens
      const { data: tokenData, error: tokenError } = await supabase
        .from('facebook_page_tokens')
        .select('id, page_id, page_name, user_id, created_at')
        .eq('user_id', user.id);
      
      console.log('Facebook page tokens:', { data: tokenData, error: tokenError });
      setTokens(tokenData || []);
    } catch (error) {
      console.error('Error loading debug data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Facebook Connection Debug
          <Button
            size="sm"
            variant="outline"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Social Connections ({connections.length})</h3>
          {connections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No connections found</p>
          ) : (
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(connections, null, 2)}
            </pre>
          )}
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Facebook Page Tokens ({tokens.length})</h3>
          {tokens.length === 0 ? (
            <p className="text-sm text-muted-foreground">No page tokens found</p>
          ) : (
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(tokens, null, 2)}
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
