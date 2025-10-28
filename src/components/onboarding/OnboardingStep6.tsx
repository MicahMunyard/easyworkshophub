import { Mail, DollarSign, Package, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface OnboardingStep6Props {
  data: any;
  onNext: (data: any) => void;
}

const INTEGRATIONS = [
  {
    icon: Mail,
    name: 'Email Integration',
    description: 'Connect Gmail or Outlook to manage customer communications',
    color: 'text-blue-500',
  },
  {
    icon: DollarSign,
    name: 'Xero Accounting',
    description: 'Sync invoices and payments with your accounting software',
    color: 'text-green-500',
  },
  {
    icon: Package,
    name: 'EzyParts',
    description: 'Order parts directly from your parts suppliers',
    color: 'text-orange-500',
  },
  {
    icon: MessageSquare,
    name: 'Facebook Messenger',
    description: 'Chat with customers through social media',
    color: 'text-blue-600',
  },
];

const OnboardingStep6 = ({ data, onNext }: OnboardingStep6Props) => {
  const handleNext = () => {
    onNext({ step6: { skipped: true } });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center space-x-2 mb-4">
          {INTEGRATIONS.map((integration, i) => {
            const Icon = integration.icon;
            return <Icon key={i} className={`w-10 h-10 ${integration.color}`} />;
          })}
        </div>
        <h2 className="text-3xl font-bold text-foreground">Connect your tools</h2>
        <p className="text-muted-foreground">
          Integrate with your favorite tools to streamline your workflow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS.map((integration, index) => {
          const Icon = integration.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg bg-accent`}>
                  <Icon className={`w-6 h-6 ${integration.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{integration.name}</h3>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-accent/50 border-dashed">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Don't worry! You can set up these integrations anytime from Workshop Setup.
          </p>
          <p className="text-sm font-medium text-foreground">
            Let's skip this for now and get you started with the basics.
          </p>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleNext} size="lg">
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep6;
