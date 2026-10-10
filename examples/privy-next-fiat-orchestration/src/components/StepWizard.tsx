"use client";

import { useEffect, useState } from "react";
import { Check, ChevronRight, ExternalLink } from "lucide-react";
import {
  apiCall,
  ApiMeta,
  isApprovedStatus,
  KycWebhookEvent,
  KyxStatusResponse,
} from "@/lib/api";
import { cn } from "@/lib/cn";
import { type Environment } from "@/lib/config";
import { Button } from "@/lib/ui/button";
import { Callout } from "@/lib/ui/callout";
import { Card } from "@/lib/ui/card";
import {
  KycLinkStep,
  mergeWebhookData,
  StatusSnapshot,
} from "@/components/steps/KycLinkStep";
import { BankAccountStep } from "@/components/steps/BankAccountStep";
import { DepositAccountStep } from "@/components/steps/DepositAccountStep";
import { OfframpStep } from "@/components/steps/OfframpStep";

interface Props {
  getAccessToken: () => Promise<string | null>;
  userId: string;
  userEmail: string;
  walletAddress: string;
  walletId: string;
  environment: Environment;
  kycEvents: KycWebhookEvent[];
  onApiCall: (meta: ApiMeta) => void;
}

const STEPS = [
  {
    id: "tos",
    label: "Terms of service",
    docs: "https://docs.privy.io/kyc-kyb/kyc-tos",
  },
  { id: "kyc", label: "KYC", docs: "https://docs.privy.io/kyc-kyb/kyc" },
  {
    id: "deposit",
    label: "Deposit account",
    docs: "https://docs.privy.io/wallets/funding/fiat-deposits/overview",
  },
  {
    id: "bank",
    label: "Bank account",
    docs: "https://docs.privy.io/financial-flows/transfers/fiat-payouts/register-bank-account",
  },
  {
    id: "offramp",
    label: "Offramp",
    docs: "https://docs.privy.io/financial-flows/transfers/fiat-payouts/execute-payout",
  },
] as const;

const KYC_STEP = 1;

export function StepWizard({
  getAccessToken,
  userId,
  userEmail,
  walletAddress,
  walletId,
  environment,
  kycEvents,
  onApiCall,
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [snapshot, setSnapshot] = useState<KyxStatusResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = await getAccessToken();
      if (!token || cancelled) return;

      const { result, meta } = await apiCall<KyxStatusResponse | null>(
        `/kyc/status?environment=${environment}`,
        { token },
      );
      if (cancelled) return;
      onApiCall(meta);
      setSnapshot(result);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment]);

  useEffect(() => {
    const latest = kycEvents[kycEvents.length - 1];
    if (latest?.data) {
      setSnapshot((previous) =>
        mergeWebhookData(previous, latest, environment),
      );
    }
  }, [environment, kycEvents]);

  const stepProps = {
    getAccessToken,
    userId,
    userEmail,
    walletAddress,
    walletId,
    onApiCall,
  };

  const isLastStep = currentStep === STEPS.length - 1;
  const kycApproved = isApprovedStatus(snapshot?.kyc.status);
  const goNext = () => setCurrentStep((step) => step + 1);

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap items-center gap-1">
        {STEPS.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => setCurrentStep(i)}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                i === currentStep
                  ? "bg-background-interactive text-text-inverse"
                  : i < currentStep
                    ? "bg-background-success text-text-success"
                    : "bg-background-elevated text-text-muted hover:bg-background-elevated-hover",
              )}
            >
              {i < currentStep ? <Check className="size-3" /> : i + 1}
              <span>{step.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight className="mx-0.5 size-3 text-text-subtle" />
            )}
          </div>
        ))}
      </nav>

      {currentStep <= KYC_STEP && snapshot && (
        <StatusSnapshot snapshot={snapshot} />
      )}

      {/* Henri skipped KYC and got a bare 400 on the bank account step. Say
          up front that the later steps need an approved KYC. */}
      {currentStep > KYC_STEP && !kycApproved && (
        <Callout
          variant="warning"
          title="KYC isn't approved yet"
        >
          <p>
            You can look around, but Bridge won&apos;t create accounts or move
            money until KYC is approved.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setCurrentStep(KYC_STEP)}
          >
            Go to KYC
          </Button>
        </Callout>
      )}

      <div className="flex justify-end">
        <a
          href={STEPS[currentStep].docs}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-text-interactive hover:text-text-interactive-hover"
        >
          Read the docs
          <ExternalLink className="size-3" />
        </a>
      </div>

      <Card>
        {currentStep === 0 && (
          <KycLinkStep
            {...stepProps}
            environment={environment}
            step="tos"
            snapshot={snapshot}
            onSnapshotChange={setSnapshot}
            onNext={goNext}
          />
        )}
        {currentStep === 1 && (
          <KycLinkStep
            {...stepProps}
            environment={environment}
            step="kyc"
            snapshot={snapshot}
            onSnapshotChange={setSnapshot}
            onNext={goNext}
          />
        )}
        {currentStep === 2 && (
          <DepositAccountStep
            {...stepProps}
            environment={environment}
            onNext={goNext}
          />
        )}
        {currentStep === 3 && (
          <BankAccountStep
            {...stepProps}
            environment={environment}
            onNext={goNext}
          />
        )}
        {currentStep === 4 && (
          <OfframpStep {...stepProps} environment={environment} />
        )}
      </Card>

      {!isLastStep && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={goNext}>
            Skip this step
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
