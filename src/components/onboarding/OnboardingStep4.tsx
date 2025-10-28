import { useState } from 'react';
import { Users, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface OnboardingStep4Props {
  data: any;
  onNext: (data: any) => void;
}

const OnboardingStep4 = ({ data, onNext }: OnboardingStep4Props) => {
  const [technicians, setTechnicians] = useState(
    data?.step4?.technicians || [{ name: '', specialty: '', experience: '' }]
  );

  const addTechnician = () => {
    setTechnicians([...technicians, { name: '', specialty: '', experience: '' }]);
  };

  const removeTechnician = (index: number) => {
    if (technicians.length > 1) {
      setTechnicians(technicians.filter((_, i) => i !== index));
    }
  };

  const updateTechnician = (index: number, field: string, value: string) => {
    const updated = [...technicians];
    updated[index] = { ...updated[index], [field]: value };
    setTechnicians(updated);
  };

  const handleNext = () => {
    const validTechnicians = technicians.filter((t) => t.name.trim().length > 0);
    onNext({ step4: { technicians: validTechnicians } });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Users className="w-16 h-16 mx-auto text-primary" />
        <h2 className="text-3xl font-bold text-foreground">Add your team members</h2>
        <p className="text-muted-foreground">
          Add technicians and staff who will be working in your workshop
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {technicians.map((tech, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg relative">
              {technicians.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => removeTechnician(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}

              <div className="space-y-2">
                <Label>Name {index === 0 && '*'}</Label>
                <Input
                  value={tech.name}
                  onChange={(e) => updateTechnician(index, 'name', e.target.value)}
                  placeholder="e.g., John Smith"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Specialty</Label>
                  <Input
                    value={tech.specialty}
                    onChange={(e) => updateTechnician(index, 'specialty', e.target.value)}
                    placeholder="e.g., Brakes"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Experience</Label>
                  <Input
                    value={tech.experience}
                    onChange={(e) => updateTechnician(index, 'experience', e.target.value)}
                    placeholder="e.g., 5 years"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addTechnician}
            className="w-full"
            disabled={technicians.length >= 10}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Technician
          </Button>
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

export default OnboardingStep4;
