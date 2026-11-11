import { Badge, type BadgeVariant } from "../ui/badge";

export const EarnAutoDepositStatus = ({
  isEnabled,
  isLoading,
  error,
}: {
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
}) => {
  const status: { label: string; variant: BadgeVariant } = isLoading
    ? { label: "Checking…", variant: "default" }
    : error
      ? { label: "Unavailable", variant: "destructive" }
      : isEnabled
        ? { label: "On", variant: "success" }
        : { label: "Off", variant: "default" };

  return (
    <div className="mt-3 w-full max-w-[480px] rounded-xl border border-[#E2E3F0] bg-white p-4 text-[14px]">
      <div className="flex items-center gap-2">
        <p className="font-medium">Earn auto-deposit</p>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {error && (
        <p className="mt-2 rounded-md bg-[#FDECEA] p-2 text-[13px] font-light break-words text-[#7F1D1D]">
          {error}
        </p>
      )}

      <p className="mt-2 font-light">
        Once on, a Privy wallet automation deposits the funding wallet&apos;s
        OUSD into Earn whenever OUSD arrives on Tempo. A card that spends from
        Earn then pays for purchases with those vault shares. Send OUSD on Tempo
        mainnet to the funding wallet address above to fund it.
      </p>
    </div>
  );
};
