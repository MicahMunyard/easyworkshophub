import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Mail, Phone } from "lucide-react";

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureKey: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ open, onOpenChange, featureKey }) => {
  const tier1Features = [
    "Booking System",
    "Customer CRM",
    "Oil Dispensary Monitor"
  ];

  const tier2Features = [
    "Everything in Starter",
    "Invoicing & Financial Management",
    "Email Integration",
    "Social Media Communication",
    "Inventory Management",
    "Marketing Tools",
    "Reports & Analytics",
    "Timesheets",
    "EzyParts Integration"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upgrade to Full Access</DialogTitle>
          <DialogDescription>
            Unlock all features of WorkshopBase to supercharge your workshop management.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Plan */}
          <div>
            <h4 className="text-sm font-medium mb-2">Starter (Current)</h4>
            <ul className="space-y-2">
              {tier1Features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Full Access Plan */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2 text-primary">Full Access</h4>
            <ul className="space-y-2">
              {tier2Features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="border-t pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Contact us to upgrade your account
            </p>
            <div className="flex flex-col gap-2">
              <Button className="w-full gap-2" asChild>
                <a href="mailto:sales@workshopbase.com">
                  <Mail className="h-4 w-4" />
                  Email Sales
                </a>
              </Button>
              <Button variant="outline" className="w-full gap-2" asChild>
                <a href="tel:+1234567890">
                  <Phone className="h-4 w-4" />
                  Call Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
