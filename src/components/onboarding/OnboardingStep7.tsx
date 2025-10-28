import { CheckCircle2, Calendar, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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

const OnboardingStep7 = ({ onComplete, loading }: OnboardingStep7Props) => {
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
          Your WorkshopBase account is ready to go. Here's what you can do next:
        </p>
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

      <Card className="p-6 bg-accent/50">
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground text-center">Need Help?</h3>
          <p className="text-sm text-muted-foreground text-center">
            Visit Workshop Setup anytime to adjust your services, team, business hours, and more.
            You can also connect integrations whenever you're ready.
          </p>
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
