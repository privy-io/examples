import { base } from 'viem/chains';

// Network Configuration
export const CHAIN = base;
// USDC on Base Mainnet
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
export const USDC_DECIMALS = 6;

// Privy API — must match the URL used for authorization signature signing
export const PRIVY_API_URL = 'https://api.privy.io/v1';

// Environment variables (set these in .env.local)
export const getVaultId = () => process.env.NEXT_PUBLIC_VAULT_ID || '';
export const getFeeRecipientWalletId = () => process.env.NEXT_PUBLIC_FEE_RECIPIENT_WALLET_ID || '';

// Format USDC amount for display (from smallest unit to human readable)
export function formatUSDC(amount: string | bigint): string {
  const value = typeof amount === 'string' ? BigInt(amount) : amount;
  const wholePart = value / BigInt(10 ** USDC_DECIMALS);
  const fractionalPart = value % BigInt(10 ** USDC_DECIMALS);
  const fractionalStr = fractionalPart.toString().padStart(USDC_DECIMALS, '0');
  return `${wholePart}.${fractionalStr.slice(0, 2)}`;
}

// Parse human readable USDC to smallest unit (wei equivalent)
export function parseUSDC(amount: string): string {
  const [whole, decimal = ''] = amount.split('.');
  const paddedDecimal = decimal.padEnd(USDC_DECIMALS, '0').slice(0, USDC_DECIMALS);
  return `${whole}${paddedDecimal}`;
}

// Truncate address for display
export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
