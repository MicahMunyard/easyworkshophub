import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OnboardingStep5Props {
  data: any;
  onNext: (data: any) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

const OnboardingStep5 = ({ data, onNext }: OnboardingStep5Props) => {
  const [workingDays, setWorkingDays] = useState<string[]>(
    data?.step5?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  );
  const [openTime, setOpenTime] = useState(data?.step5?.openTime || '08:00');
  const [closeTime, setCloseTime] = useState(data?.step5?.closeTime || '17:00');
  const [slotDuration, setSlotDuration] = useState(data?.step5?.slotDuration || '30');

  const toggleDay = (day: string) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleNext = () => {
    onNext({ step5: { workingDays, openTime, closeTime, slotDuration } });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Clock className="w-16 h-16 mx-auto text-primary" />
        <h2 className="text-3xl font-bold text-foreground">Set your business hours</h2>
        <p className="text-muted-foreground">
          Let customers know when you're available for bookings
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Working Days</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => toggleDay(day)}
                >
                  <Checkbox
                    checked={workingDays.includes(day)}
                    onCheckedChange={() => toggleDay(day)}
                  />
                  <Label className="cursor-pointer">{day.slice(0, 3)}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Opening Time</Label>
              <Select value={openTime} onValueChange={setOpenTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.slice(0, 20).map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Closing Time</Label>
              <Select value={closeTime} onValueChange={setCloseTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.slice(8).map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Booking Slot Duration</Label>
            <Select value={slotDuration} onValueChange={setSlotDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              This determines the minimum time slot for bookings
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

export default OnboardingStep5;
