import { createX402Client } from '@privy-io/node/x402';
import { wrapFetchWithPayment } from '@x402/fetch';
import { getPrivyClient } from './privy';

/**
 * Execute an x402 payment request
 * Uses Privy's createX402Client for automatic 402 payment handling
 */
export async function executeX402Request(
  walletId: string,
  address: `0x${string}`,
  url: string,
  options?: RequestInit
): Promise<Response> {
  const x402client = createX402Client(getPrivyClient(), { walletId, address });
  const agentFetch = wrapFetchWithPayment(fetch, x402client);

  // Add timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    // Add Vercel protection bypass header for server-to-server requests
    const headers = new Headers(options?.headers);
    if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
      headers.set('x-vercel-protection-bypass', process.env.VERCEL_AUTOMATION_BYPASS_SECRET);
    }

    const response = await agentFetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
