import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, TrendingUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type CommonQuestion = {
  question: string;
  count: number;
  category: string | null;
};

const AIChatAnalytics: React.FC = () => {
  const [commonQuestions, setCommonQuestions] = useState<CommonQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCommonQuestions();
  }, []);

  const loadCommonQuestions = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_common_questions', { days_ago: 30, limit_count: 10 });

      if (error) throw error;
      setCommonQuestions(data || []);
    } catch (error) {
      console.error('Error loading common questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            AI Assistant Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading insights...</p>
        </CardContent>
      </Card>
    );
  }

  if (commonQuestions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          AI Assistant Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mb-4">
            Most common questions asked in the last 30 days:
          </p>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {commonQuestions.map((q, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {q.count}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">
                      {q.question}
                    </p>
                    {q.category && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {q.category}
                      </p>
                    )}
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChatAnalytics;
