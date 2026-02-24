/**
 * In-memory transaction store for the yield demo.
 *
 * Transactions are seeded by deposit/withdraw API responses with status "pending",
 * then updated in real-time via Privy webhooks as they confirm or fail.
 */

export interface Transaction {
  id: string;
  wallet_id: string;
  vault_id: string;
  type: string; // "deposit" | "withdraw"
  status: string; // "pending" | "confirmed" | "failed"
  asset_amount: string;
  share_amount?: string;
  transaction_id?: string;
  approval_transaction_id?: string;
  created_at: number;
  updated_at: number;
}

const store = new Map<string, Transaction>();

/**
 * Insert or update a transaction, keeping the version with the later `updated_at`
 * to avoid overwriting webhook data with a stale API response.
 */
export function upsertTransaction(tx: Transaction): void {
  const existing = store.get(tx.id);
  if (!existing || tx.updated_at >= existing.updated_at) {
    store.set(tx.id, tx);
  }
}

/**
 * Return all transactions for a given wallet, sorted newest-first by created_at.
 */
export function getTransactionsByWallet(walletId: string): Transaction[] {
  return Array.from(store.values())
    .filter((tx) => tx.wallet_id === walletId)
    .sort((a, b) => b.created_at - a.created_at);
}
