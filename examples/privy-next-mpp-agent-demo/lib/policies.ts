/**
 * Format currency amount for display
 */
export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
