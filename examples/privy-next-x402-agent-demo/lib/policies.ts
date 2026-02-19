/**
 * Agent spending policy configuration
 */
export interface AgentPolicy {
  /** Maximum amount per transaction in USD cents */
  maxPerTransaction: number;
  /** The Privy policy ID for enforcing spending limits */
  privyPolicyId?: string;
}

/**
 * Format currency amount for display
 */
export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
