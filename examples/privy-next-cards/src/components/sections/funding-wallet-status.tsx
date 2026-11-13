import { TEMPO_MAINNET, TEMPO_TESTNET } from "@/chains";
import { Badge, type BadgeVariant } from "../ui/badge";

export const FundingWalletStatus = ({
  address,
  cardId,
  error,
  isLoading,
  isSandbox,
  chainLabel,
  token,
  totalCards,
  earnBalances,
}: {
  address?: string;
  cardId: string | null;
  error: string | null;
  isLoading: boolean;
  isSandbox: boolean;
  chainLabel: string;
  token: string | null;
  totalCards: number;
  /** OUSD in the wallet and in Earn, for a production card that spends from Earn. */
  earnBalances?: { ousd: string; shares: string; earnValue: string } | null;
}) => {
  if (!address) {
    return (
      <p className="text-[14px] font-light">
        Waiting for an embedded Ethereum wallet. The provider creates one on
        login for users without one.
      </p>
    );
  }

  const status: { label: string; variant: BadgeVariant } = isLoading
    ? { label: "Checking…", variant: "default" }
    : cardId
      ? { label: "Card created", variant: "success" }
      : error
        ? { label: "Lookup failed", variant: "destructive" }
        : totalCards > 0
          ? { label: "Card cancelled", variant: "warning" }
          : { label: "No card yet", variant: "default" };

  return (
    <div className="w-full max-w-[480px] rounded-xl border border-[#E2E3F0] bg-white p-4 text-[14px]">
      <div className="flex items-center gap-2">
        <p className="font-medium">Funding wallet</p>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {error && (
        <p className="mt-2 rounded-md bg-[#FDECEA] p-2 text-[13px] font-light break-words text-[#7F1D1D]">
          {error}
        </p>
      )}

      {!error && !cardId && totalCards > 0 && (
        <p className="mt-2 text-[13px] font-light">
          {totalCards === 1 ? "The card" : `All ${totalCards} cards`} on this
          wallet {totalCards === 1 ? "has" : "have"} been cancelled, so there is
          nothing to summarize. Sign up again for a new one.
        </p>
      )}

      <a
        href={`${(isSandbox ? TEMPO_TESTNET : TEMPO_MAINNET).blockExplorers.default.url}/address/${address}`}
        target="_blank"
        rel="noreferrer"
        className="block font-light break-all underline underline-offset-2"
      >
        {address}
      </a>
      {earnBalances && (
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[13px]">
          <dt className="font-medium">Wallet</dt>
          <dd className="font-light">{earnBalances.ousd} OUSD</dd>
          <dt className="font-medium">Earn</dt>
          <dd className="font-light">
            {earnBalances.earnValue} OUSD ({earnBalances.shares} vault shares)
          </dd>
        </dl>
      )}
      <p className="mt-2 font-light">
        {isSandbox ? (
          <>
            The card spends {token} on {chainLabel} from this wallet. Tempo has
            no native gas token — fees are paid in the same stablecoin — so one
            faucet top-up covers both the approval and the card.
          </>
        ) : (
          <>
            The card spends the real stablecoin configured for this deployment
            on {chainLabel} from this wallet. Fees are paid in stablecoin rather
            than a native gas token, so no separate gas balance is needed.
          </>
        )}
      </p>
    </div>
  );
};
