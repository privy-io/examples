export const ProductionCardWarning = ({
  isConfigured,
}: {
  isConfigured: boolean;
}) => (
  <p className="mt-3 w-full max-w-[480px] rounded-xl bg-[#FFF4E5] p-3 text-[13px] font-light text-[#663C00]">
    Production uses real money. New cards use OUSD on Tempo.{" "}
    {isConfigured
      ? "Signup uses an existing card's funding settings when available. Tempo OUSD and Base USDC require their own production approval targets."
      : "New cards need NEXT_PUBLIC_CARD_USDC_ADDRESS (Tempo OUSD) and NEXT_PUBLIC_CARD_SPENDER_ADDRESS. Existing Base USDC cards need NEXT_PUBLIC_BASE_CARD_SPENDER_ADDRESS instead."}{" "}
    Simulated purchases are sandbox-only &mdash; Stripe&apos;s test helpers do
    not exist for live keys.
  </p>
);
