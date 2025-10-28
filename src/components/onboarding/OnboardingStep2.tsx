import { useState } from 'react';
import { Wrench, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface OnboardingStep2Props {
  data: any;
  onNext: (data: any) => void;
}

const COMMON_SERVICES = [
  { name: 'Oil Change', duration: 30, price: 50 },
  { name: 'Brake Service', duration: 60, price: 150 },
  { name: 'Tire Rotation', duration: 30, price: 40 },
  { name: 'Engine Diagnostics', duration: 45, price: 100 },
  { name: 'Air Conditioning Service', duration: 60, price: 120 },
  { name: 'General Inspection', duration: 45, price: 75 },
];

const OnboardingStep2 = ({ data, onNext }: OnboardingStep2Props) => {
  const [selectedServices, setSelectedServices] = useState<string[]>(
    data?.step2?.selectedServices || []
  );
  const [customService, setCustomService] = useState({ name: '', duration: '', price: '' });

  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const handleNext = () => {
    const services = COMMON_SERVICES.filter((s) => selectedServices.includes(s.name));
    onNext({ step2: { selectedServices, services } });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Wrench className="w-16 h-16 mx-auto text-primary" />
        <h2 className="text-3xl font-bold text-foreground">What services do you offer?</h2>
        <p className="text-muted-foreground">
          Select the services you commonly provide. You can customize pricing and duration later.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COMMON_SERVICES.map((service) => (
              <div
                key={service.name}
                className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => toggleService(service.name)}
              >
                <Checkbox
                  checked={selectedServices.includes(service.name)}
                  onCheckedChange={() => toggleService(service.name)}
                />
                <div className="flex-1">
                  <div className="font-medium text-foreground">{service.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {service.duration} min • ${service.price}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              You can add custom services and adjust pricing in Workshop Setup
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

export default OnboardingStep2;
