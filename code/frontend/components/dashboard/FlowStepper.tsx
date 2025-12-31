"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type FlowStepperProps = {
  steps: string[];
  activeStep: string;
};

export function FlowStepper({ steps, activeStep }: FlowStepperProps) {
  return (
    <div className="w-full rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/20 p-3 shadow-[0_10px_40px_rgba(17,17,17,0.7)]">
      <div className="grid grid-cols-5 gap-2">
        {steps.map((step, index) => {
          const isActive = activeStep === step;
          const isComplete = steps.indexOf(activeStep) > index;

          return (
            <div
              key={step}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-all duration-200",
                "bg-black/40 border-amber-500/15 text-amber-100/80 hover:border-amber-400/50 hover:text-amber-50",
                isActive && "bg-amber-500/15 border-amber-400 text-amber-50 shadow-[0_10px_40px_rgba(251,191,36,0.15)]",
                isComplete && !isActive && "border-amber-500/30 text-amber-100"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                  "border-amber-500/30 bg-black/50 text-amber-200",
                  isActive && "bg-amber-400 text-black border-amber-300",
                  isComplete && "bg-amber-500/30 border-amber-400/60"
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span className="font-semibold tracking-tight">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FlowStepper;
