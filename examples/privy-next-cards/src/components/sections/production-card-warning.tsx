export const ProductionCardWarning = ({
  isConfigured,
  token,
}: {
  isConfigured: boolean;
  token: string;
}) => (
  <p className="mt-3 w-full max-w-[480px] rounded-xl bg-[#FFF4E5] p-3 text-[13px] font-light text-[#663C00]">
    Production uses real money.{" "}
    {isConfigured
      ? `Signup grants a real ${token} allowance to the Bridge spender configured in this deployment's env, so a card issued here can spend.`
      : "Signup is disabled until NEXT_PUBLIC_CARD_SPENDER_ADDRESS is set. The SDK requires the mainnet spender, since Bridge does not publish it. The stablecoin is PathUSD or OUSD from the funding-token toggle."}{" "}
    Simulated purchases are sandbox-only &mdash; Stripe&apos;s test helpers do
    not exist for live keys.
  </p>
);
