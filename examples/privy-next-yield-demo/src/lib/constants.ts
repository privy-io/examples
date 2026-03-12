import { base } from 'viem/chains';

// Network Configuration
export const CHAIN = base;
// USDC on Base Mainnet
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
export const USDC_DECIMALS = 6;
export const USDC_TOKEN = { token_symbol: 'USDC', token_decimals: USDC_DECIMALS };

// Privy API — must match the URL used for authorization signature signing
export const PRIVY_API_URL = 'https://api.privy.io/v1';

// Environment variables (set these in .env.local)
export const getVaultId = () => process.env.NEXT_PUBLIC_VAULT_ID || '';
export const getAdminWalletId = () => process.env.NEXT_PUBLIC_ADMIN_WALLET_ID || '';

// Format USDC amount for display (from smallest unit to human readable)
export function formatUSDC(amount: string | bigint): string {
  return formatTokenAmount(amount, USDC_DECIMALS);
}

// Parse human readable USDC to smallest unit (wei equivalent)
export function parseUSDC(amount: string): string {
  const [whole, decimal = ''] = amount.split('.');
  const paddedDecimal = decimal.padEnd(USDC_DECIMALS, '0').slice(0, USDC_DECIMALS);
  return `${whole}${paddedDecimal}`;
}

// MORPHO on Base Mainnet
export const MORPHO_ADDRESS = '0xBAa5CC21fd487B8Fcc2F632f3F4E8D37262a0842';
export const MORPHO_DECIMALS = 18;

// Format any token amount for display (from smallest unit to human readable)
export function formatTokenAmount(
  amount: string | bigint,
  decimals: number,
  displayDecimals: number = 2
): string {
  const value = typeof amount === 'string' ? BigInt(amount) : amount;
  const divisor = BigInt(10 ** decimals);
  const wholePart = value / divisor;
  const fractionalPart = value % divisor;
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  return `${wholePart}.${fractionalStr.slice(0, displayDecimals)}`;
}

// Truncate address for display
export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
