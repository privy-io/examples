'use client';

interface StepIndicatorProps {
  currentStep: number;
  steps: { label: string; description?: string }[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={index} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                    isCompleted
                      ? 'bg-violet-500 text-white'
                      : isCurrent
                        ? 'bg-violet-600 text-white ring-4 ring-violet-600/20'
                        : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-xs font-medium ${
                      isCurrent ? 'text-violet-600' : isCompleted ? 'text-violet-600' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </div>
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-12 sm:w-16 transition-all ${
                    stepNumber < currentStep ? 'bg-violet-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const WIZARD_STEPS = [
  { label: 'Create', description: 'Create your agent' },
  { label: 'Fund', description: 'Add funds' },
  { label: 'Policy', description: 'Set limits' },
  { label: 'Actions', description: 'Execute' },
];
