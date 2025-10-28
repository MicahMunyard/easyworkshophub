import { useState } from 'react';
import { Warehouse, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface OnboardingStep3Props {
  data: any;
  onNext: (data: any) => void;
}

const OnboardingStep3 = ({ data, onNext }: OnboardingStep3Props) => {
  const [bayCount, setBayCount] = useState(data?.step3?.bayCount || 2);

  const handleNext = () => {
    const bays = Array.from({ length: bayCount }, (_, i) => ({
      name: `Bay ${i + 1}`,
      type: 'General',
      equipment: '',
    }));
    onNext({ step3: { bayCount, bays } });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Warehouse className="w-16 h-16 mx-auto text-primary" />
        <h2 className="text-3xl font-bold text-foreground">How many service bays do you have?</h2>
        <p className="text-muted-foreground">
          This helps us organize your bookings and schedule. You can customize each bay later.
        </p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-center space-x-6">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setBayCount(Math.max(1, bayCount - 1))}
              disabled={bayCount <= 1}
            >
              <Minus className="w-5 h-5" />
            </Button>

            <div className="text-center">
              <div className="text-6xl font-bold text-primary">{bayCount}</div>
              <div className="text-sm text-muted-foreground mt-2">Service Bays</div>
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setBayCount(Math.min(20, bayCount + 1))}
              disabled={bayCount >= 20}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              We'll create {bayCount} service bay{bayCount !== 1 ? 's' : ''} for your workshop
            </p>
            <p className="text-xs text-muted-foreground">
              (Bay 1, Bay 2, Bay 3, etc. - you can rename them later)
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleNext} size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep3;
