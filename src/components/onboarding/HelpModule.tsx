import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HelpModuleProps {
  title: string;
  duration: string;
  icon: LucideIcon;
  children: React.ReactNode;
  completed?: boolean;
  onComplete?: () => void;
}

const HelpModule = ({ 
  title, 
  duration, 
  icon: Icon, 
  children, 
  completed = false,
  onComplete 
}: HelpModuleProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      completed && "border-primary/50 bg-primary/5"
    )}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left hover:bg-accent/50 transition-colors flex items-start gap-4"
      >
        <div className={cn(
          "p-3 rounded-lg shrink-0",
          completed ? "bg-primary/20" : "bg-accent"
        )}>
          <Icon className={cn(
            "w-6 h-6",
            completed ? "text-primary" : "text-muted-foreground"
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-1">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {completed ? (
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            ) : (
              <span className="text-xs text-muted-foreground shrink-0">{duration}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {isExpanded ? 'Click to collapse' : 'Click to expand and learn'}
          </p>
        </div>

        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 pt-2 space-y-4 border-t">
          <div className="prose prose-sm max-w-none">
            {children}
          </div>
          
          {!completed && onComplete && (
            <Button 
              onClick={onComplete} 
              size="sm" 
              variant="outline"
              className="w-full"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default HelpModule;
