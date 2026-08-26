import type {
  LinkedAccountWithMetadata,
  WalletWithMetadata,
} from "@privy-io/react-auth";

/** An embedded wallet whose Privy `id` is known, which is what `SignUpForCardView` needs. */
type EmbeddedWallet = WalletWithMetadata & { id: string };

/**
 * The user's embedded EVM wallet.
 *
 * `SignUpForCardView` takes a Privy **wallet id**, which `useWallets()` does not expose — its
 * `ConnectedWallet` objects only carry an address. The id lives on the user's linked accounts, so
 * the wallet is picked out of there instead. `id` is optional on that type, so it is narrowed here
 * rather than asserted at the call site. Restricted to `ethereum` because the card funds from an
 * EVM chain.
 *
 * TODO: drop this once the SDK can resolve a Privy wallet id from a connected wallet.
 */
export const findEmbeddedWallet = (accounts: LinkedAccountWithMetadata[]) =>
  accounts.find(
    (account): account is EmbeddedWallet =>
      account.type === "wallet" &&
      account.walletClientType === "privy" &&
      account.connectorType === "embedded" &&
      account.chainType === "ethereum" &&
      typeof account.id === "string",
  );
