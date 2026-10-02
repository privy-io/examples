export const ProductionCardWarning = ({
  isConfigured,
}: {
  isConfigured: boolean;
}) => (
  <p className="mt-3 w-full max-w-[480px] rounded-xl bg-[#FFF4E5] p-3 text-[13px] font-light text-[#663C00]">
    Production uses real money.{" "}
    {isConfigured
      ? "Signup grants a real USDC allowance to the Bridge spender configured in this deployment's env, so a card issued here can spend."
      : "Signup is disabled until NEXT_PUBLIC_CARD_USDC_ADDRESS and NEXT_PUBLIC_CARD_SPENDER_ADDRESS are set — the SDK requires the mainnet spend-approval target, since Bridge does not publish it."}{" "}
    Simulated purchases are sandbox-only &mdash; Stripe&apos;s test helpers do
    not exist for live keys.
  </p>
);
