import { useState } from 'react';
import { CheckCircle2, Calendar, Users, Settings, BookOpen, HelpCircle, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface OnboardingStep7Props {
  onComplete: () => void;
  loading: boolean;
}

const FEATURES = [
  {
    icon: Calendar,
    title: 'Create Your First Booking',
    description: 'Go to Booking Diary to schedule appointments for your customers',
  },
  {
    icon: Users,
    title: 'Manage Customers',
    description: 'Add customer details and vehicle information to build your database',
  },
  {
    icon: Settings,
    title: 'Customize Your Setup',
    description: 'Visit Workshop Setup to fine-tune services, bays, and team members',
  },
];

const FIRST_WEEK_CHECKLIST = [
  {
    day: 'Day 1',
    tasks: [
      { id: 'add-customer', title: 'Add your first real customer' },
      { id: 'create-booking', title: 'Create your first booking' },
      { id: 'review-inventory', title: 'Review your inventory levels' },
    ],
  },
  {
    day: 'Day 2-3',
    tasks: [
      { id: 'test-calendar', title: 'Practice using the booking calendar' },
      { id: 'order-parts', title: 'Test ordering from a supplier' },
      { id: 'explore-dashboard', title: 'Familiarize yourself with the dashboard' },
    ],
  },
  {
    day: 'Day 4-5',
    tasks: [
      { id: 'setup-email', title: 'Set up email integration (optional)' },
      { id: 'configure-integrations', title: 'Configure other integrations if needed' },
      { id: 'invite-team', title: 'Invite team members and set up technicians' },
    ],
  },
  {
    day: 'Week 2',
    tasks: [
      { id: 'review-week', title: 'Review first week\'s bookings and jobs' },
      { id: 'check-stock', title: 'Check inventory levels and reorder if needed' },
      { id: 'create-invoice', title: 'Generate your first invoice' },
    ],
  },
];

const OnboardingStep7 = ({ onComplete, loading }: OnboardingStep7Props) => {
  const [checkedTasks, setCheckedTasks] = useState<string[]>([]);

  const toggleTask = (taskId: string) => {
    if (checkedTasks.includes(taskId)) {
      setCheckedTasks(checkedTasks.filter(id => id !== taskId));
    } else {
      setCheckedTasks([...checkedTasks, taskId]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10">
            <CheckCircle2 className="w-20 h-20 text-primary" />
          </div>
        </div>
        <h2 className="text-4xl font-bold text-foreground">You're all set!</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your WorkshopBase account is ready to go. Here's your plan for the first week:
        </p>
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Your First Week Checklist</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Follow this guide to get comfortable with WorkshopBase. Check off tasks as you complete them!
          </p>
        </div>
      </Card>

      <div className="space-y-6">
        {FIRST_WEEK_CHECKLIST.map((section, sectionIdx) => (
          <Card key={sectionIdx} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground text-lg">{section.day}</h4>
                <span className="text-xs text-muted-foreground bg-accent px-3 py-1 rounded-full">
                  {section.tasks.filter(t => checkedTasks.includes(t.id)).length} / {section.tasks.length} done
                </span>
              </div>
              
              <div className="space-y-2">
                {section.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    {checkedTasks.includes(task.id) ? (
                      <CheckSquare className="w-5 h-5 text-primary shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                    <span className={cn(
                      "text-sm",
                      checkedTasks.includes(task.id) 
                        ? "text-muted-foreground line-through" 
                        : "text-foreground"
                    )}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="p-6 text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-accent/50 border-dashed">
        <div className="space-y-4">
          <div className="flex items-center gap-3 justify-center">
            <HelpCircle className="w-6 h-6 text-primary" />
            <h3 className="font-semibold text-foreground">Need Help Getting Started?</h3>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="text-center">
              Visit <strong>Workshop Setup</strong> anytime to adjust your services, team, business hours, and more.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="font-medium text-foreground mb-1">📧 Support Email</p>
                <p className="text-xs">support@workshopbase.com</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="font-medium text-foreground mb-1">📚 Help Center</p>
                <p className="text-xs">Access guides and tutorials</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-center pt-4">
        <Button onClick={onComplete} size="lg" className="min-w-64" disabled={loading}>
          {loading ? 'Setting up...' : 'Start Using WorkshopBase'}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep7;
