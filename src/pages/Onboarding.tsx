import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import OnboardingStep1 from '@/components/onboarding/OnboardingStep1';
import OnboardingStep2 from '@/components/onboarding/OnboardingStep2';
import OnboardingStep3 from '@/components/onboarding/OnboardingStep3';
import OnboardingStep4 from '@/components/onboarding/OnboardingStep4';
import OnboardingStep5 from '@/components/onboarding/OnboardingStep5';
import OnboardingStep6 from '@/components/onboarding/OnboardingStep6';
import OnboardingStep7 from '@/components/onboarding/OnboardingStep7';

const TOTAL_STEPS = 7;

const Onboarding = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate('/', { replace: true });
      return;
    }
    
    if (profile?.onboarding_step) {
      setCurrentStep(profile.onboarding_step);
    }
    
    if (profile?.onboarding_data) {
      setOnboardingData(profile.onboarding_data);
    }
  }, [profile, navigate]);

  const saveProgress = async (step: number, data: any) => {
    if (!user) return;

    try {
      const updatedData = { ...onboardingData, ...data };
      setOnboardingData(updatedData);

      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_step: step,
          onboarding_data: updatedData,
        })
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error saving progress:', error);
      toast({
        title: 'Error saving progress',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_step: TOTAL_STEPS,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Welcome to WorkshopBase!',
        description: 'Your workshop is all set up and ready to go.',
      });

      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error completing onboarding',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async (stepData?: any) => {
    if (stepData) {
      await saveProgress(currentStep + 1, stepData);
    }

    if (currentStep === TOTAL_STEPS) {
      await completeOnboarding();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await saveProgress(currentStep + 1, {});
    if (currentStep === TOTAL_STEPS) {
      await completeOnboarding();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Welcome to WorkshopBase</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        {currentStep === 1 && <OnboardingStep1 data={onboardingData} onNext={handleNext} />}
        {currentStep === 2 && <OnboardingStep2 data={onboardingData} onNext={handleNext} />}
        {currentStep === 3 && <OnboardingStep3 data={onboardingData} onNext={handleNext} />}
        {currentStep === 4 && <OnboardingStep4 data={onboardingData} onNext={handleNext} />}
        {currentStep === 5 && <OnboardingStep5 data={onboardingData} onNext={handleNext} />}
        {currentStep === 6 && <OnboardingStep6 data={onboardingData} onNext={handleNext} />}
        {currentStep === 7 && <OnboardingStep7 onComplete={completeOnboarding} loading={loading} />}
      </div>

      {/* Footer Navigation */}
      {currentStep < TOTAL_STEPS && (
        <div className="border-t bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep > 1 && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip for now
              </Button>
            )}

            <div className="flex-1" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
