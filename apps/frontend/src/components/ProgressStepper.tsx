'use client';

import { cn } from '@/lib/utils';
import { 
  User, 
  Phone, 
  Share2, 
  Check 
} from 'lucide-react';

interface StepProps {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCompleted: boolean;
  isLast?: boolean;
}

function Step({ 
  step, 
  title, 
  description, 
  icon, 
  isActive, 
  isCompleted, 
  isLast = false 
}: StepProps) {
  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center">
        {/* Step Circle */}
        <div
          className={cn(
            "relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300",
            isCompleted
              ? "border-primary bg-primary text-primary-foreground"
              : isActive
              ? "border-primary bg-background text-primary shadow-md"
              : "border-muted bg-background text-muted-foreground"
          )}
        >
          {isCompleted ? (
            <Check className="h-5 w-5" />
          ) : (
            <div className="h-5 w-5">
              {icon}
            </div>
          )}
        </div>
        
        {/* Step Info */}
        <div className="mt-3 text-center">
          <div
            className={cn(
              "text-sm font-semibold transition-colors duration-300",
              isActive || isCompleted
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {title}
          </div>
          <div
            className={cn(
              "text-xs transition-colors duration-300",
              isActive || isCompleted
                ? "text-muted-foreground"
                : "text-muted-foreground/60"
            )}
          >
            {description}
          </div>
        </div>
      </div>
      
      {/* Connector Line */}
      {!isLast && (
        <div className="mb-8 flex-1 mx-4">
          <div
            className={cn(
              "h-0.5 w-full transition-colors duration-300",
              isCompleted
                ? "bg-primary"
                : "bg-muted"
            )}
          />
        </div>
      )}
    </div>
  );
}

interface ProgressStepperProps {
  currentStep: number;
  className?: string;
}

export function ProgressStepper({ currentStep, className }: ProgressStepperProps) {
  const steps = [
    {
      step: 1,
      title: "Personal Info",
      description: "Basic details",
      icon: <User className="h-5 w-5" />
    },
    {
      step: 2,
      title: "Contact",
      description: "Phone & email",
      icon: <Phone className="h-5 w-5" />
    },
    {
      step: 3,
      title: "Social & Theme",
      description: "Final touches",
      icon: <Share2 className="h-5 w-5" />
    }
  ];

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Desktop Horizontal Layout */}
      <div className="hidden md:flex items-start justify-between">
        {steps.map((step, index) => (
          <Step
            key={step.step}
            step={step.step}
            title={step.title}
            description={step.description}
            icon={step.icon}
            isActive={currentStep === step.step}
            isCompleted={currentStep > step.step}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
      
      {/* Mobile Vertical Layout */}
      <div className="md:hidden space-y-4">
        {steps.map((step) => (
          <div key={step.step} className="flex items-center space-x-4">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                currentStep > step.step
                  ? "border-primary bg-primary text-primary-foreground"
                  : currentStep === step.step
                  ? "border-primary bg-background text-primary"
                  : "border-muted bg-background text-muted-foreground"
              )}
            >
              {currentStep > step.step ? (
                <Check className="h-4 w-4" />
              ) : (
                <div className="h-4 w-4">
                  {step.icon}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div
                className={cn(
                  "text-sm font-semibold",
                  currentStep >= step.step
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.title}
              </div>
              <div
                className={cn(
                  "text-xs",
                  currentStep >= step.step
                    ? "text-muted-foreground"
                    : "text-muted-foreground/60"
                )}
              >
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
