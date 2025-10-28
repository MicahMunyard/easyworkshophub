import { useState } from 'react';
import { Building2, Mail, Phone, MapPin, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface OnboardingStep1Props {
  data: any;
  onNext: (data: any) => void;
}

const OnboardingStep1 = ({ data, onNext }: OnboardingStep1Props) => {
  const [formData, setFormData] = useState({
    workshopName: data?.workshopName || '',
    email: data?.email || '',
    phone: data?.phone || '',
    address: data?.address || '',
    logo: data?.logo || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ step1: formData });
  };

  const isValid = formData.workshopName.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Building2 className="w-16 h-16 mx-auto text-primary" />
        <h2 className="text-3xl font-bold text-foreground">Let's set up your workshop</h2>
        <p className="text-muted-foreground">
          Tell us about your business so we can personalize your experience
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="workshopName" className="required">
              Workshop Name *
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="workshopName"
                value={formData.workshopName}
                onChange={(e) => setFormData({ ...formData, workshopName: e.target.value })}
                placeholder="e.g., Joe's Auto Repair"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Business Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@workshop.com"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main St, City, State, ZIP"
                className="pl-10 min-h-20"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" size="lg" disabled={!isValid}>
              Continue
            </Button>
          </div>
        </form>
      </Card>

      <p className="text-sm text-center text-muted-foreground">
        Don't worry, you can always change these details later in Workshop Setup
      </p>
    </div>
  );
};

export default OnboardingStep1;
