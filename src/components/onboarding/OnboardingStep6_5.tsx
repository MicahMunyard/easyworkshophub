import { useState } from 'react';
import { CheckSquare, Square, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface OnboardingStep6_5Props {
  data: any;
  onNext: (data: any) => void;
}

const DEMO_TASKS = [
  {
    id: 'view-dashboard',
    title: 'Explore the Dashboard',
    description: 'Navigate to the Dashboard to see key metrics and alerts',
    hint: 'Click "Dashboard" in the main navigation',
  },
  {
    id: 'check-bookings',
    title: 'View the Booking Calendar',
    description: 'Check out the booking diary to see how appointments are displayed',
    hint: 'Click "Bookings" in the navigation',
  },
  {
    id: 'review-inventory',
    title: 'Review Inventory Levels',
    description: 'Look at the inventory page to see stock levels and low stock alerts',
    hint: 'Click "Inventory" in the navigation',
  },
  {
    id: 'understand-suppliers',
    title: 'Check Suppliers',
    description: 'Visit the Suppliers section to see where you can order parts from',
    hint: 'Go to Inventory → Suppliers tab',
  },
  {
    id: 'explore-customers',
    title: 'Browse Customers',
    description: 'See how customer information is organized',
    hint: 'Click "Customers" in the navigation',
  },
];

const OnboardingStep6_5 = ({ data, onNext }: OnboardingStep6_5Props) => {
  const [completedTasks, setCompletedTasks] = useState<string[]>(
    data.demoTasks || []
  );

  const toggleTask = (taskId: string) => {
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(completedTasks.filter(id => id !== taskId));
    } else {
      setCompletedTasks([...completedTasks, taskId]);
    }
  };

  const handleNext = () => {
    onNext({ demoTasks: completedTasks });
  };

  const progress = (completedTasks.length / DEMO_TASKS.length) * 100;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-foreground">Try It Out!</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your account is set up with everything you configured. Take a few minutes to explore the interface 
          and familiarize yourself with where things are.
        </p>
      </div>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Exploration Checklist</h3>
            <span className="text-sm text-muted-foreground">
              {completedTasks.length} of {DEMO_TASKS.length} completed
            </span>
          </div>
          
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Check off each task as you explore. This is just to help you get comfortable with the interface.
          </p>
        </div>
      </Card>

      <div className="space-y-3">
        {DEMO_TASKS.map((task, index) => (
          <Card 
            key={task.id}
            className={cn(
              "p-5 cursor-pointer hover:shadow-md transition-all",
              completedTasks.includes(task.id) && "bg-primary/5 border-primary/30"
            )}
            onClick={() => toggleTask(task.id)}
          >
            <div className="flex items-start gap-4">
              <div className="pt-1">
                {completedTasks.includes(task.id) ? (
                  <CheckSquare className="w-6 h-6 text-primary" />
                ) : (
                  <Square className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground bg-accent px-2 py-1 rounded">
                    Task {index + 1}
                  </span>
                  <h4 className={cn(
                    "font-semibold",
                    completedTasks.includes(task.id) ? "text-primary" : "text-foreground"
                  )}>
                    {task.title}
                  </h4>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {task.description}
                </p>
                
                <div className="bg-accent/50 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Hint:</strong> {task.hint}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-accent/50">
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">📝 What to Look For</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Notice how your workshop name and details appear in various places</li>
            <li>• Check if your configured services show up in the booking system</li>
            <li>• Look at how inventory items are organized by category</li>
            <li>• See the dashboard provides a quick overview of your workshop status</li>
            <li>• Explore how everything connects together (customers → vehicles → bookings → jobs)</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6 border-dashed bg-primary/5">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Don't worry if you don't complete all tasks now. You can always explore more after onboarding!
          </p>
          {completedTasks.length === DEMO_TASKS.length && (
            <p className="text-sm font-medium text-primary">
              🎉 Excellent job exploring! You're becoming familiar with WorkshopBase.
            </p>
          )}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleNext} size="lg">
          Continue to Final Step
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep6_5;
