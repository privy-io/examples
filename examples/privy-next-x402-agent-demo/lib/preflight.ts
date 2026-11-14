import type { x402Client } from '@x402/core/client';

const SCREENING_URL = 'https://api.spendpreflight.com/v1/preflight?trial=1';
const BASE_USDC = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';

/** Optional screening before Privy signs. Native wallet policies still apply. */
export function attachPreflight(
  client: x402Client,
  resourceUrl: string,
  screeningFetch: typeof fetch = fetch,
) {
  // Bind screening to the actual request, not a merchant-supplied resource URL.
  const resource = new URL(resourceUrl);
  if (resource.protocol !== 'https:' || resource.username || resource.password) {
    throw new Error('Preflight requires an HTTPS resource without credentials');
  }
  client.onBeforePaymentCreation(async ({ paymentRequired, selectedRequirements: quote }) => {
    if (paymentRequired.x402Version !== 2 || quote.scheme !== 'exact'
      || quote.network !== 'eip155:8453' || quote.asset.toLowerCase() !== BASE_USDC
      || !/^\d+$/.test(quote.amount) || BigInt(quote.amount) > BigInt(1_000_000)) {
      return { abort: true, reason: 'Preflight denied: requires exact Base USDC at most $1' };
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      // Use plain fetch: screening can never recursively sign or pay its own 402.
      const response = await screeningFetch(SCREENING_URL, {
        method: 'POST', redirect: 'error', signal: controller.signal,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          challenge: { ...paymentRequired, accepts: [quote] },
          resource_url: resource.href,
          rules: { max_per_payment_usd: 1, allowed_networks: ['eip155:8453'], usdc_only: true },
        }),
      });
      if (!response.ok || !response.body) throw new Error('Screening unavailable');
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        for (;;) {
          const chunk = await reader.read();
          if (chunk.done) break;
          size += chunk.value.length;
          if (size > 65_536) throw new Error('Screening response too large');
          chunks.push(chunk.value);
        }
      } finally { await reader.cancel().catch(() => {}); }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      const result = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
      if (result?.decision !== 'allow' || !Array.isArray(result.reasons)
        || !result.reasons.every((reason: unknown) => typeof reason === 'string')
        || typeof result.receipt?.id !== 'string' || !result.receipt.id) {
        throw new Error('Screening did not allow payment');
      }
    } catch {
      return { abort: true, reason: 'Preflight denied: unavailable, invalid, hold or block' };
    } finally { clearTimeout(timer); controller.abort(); }
  });
  return client;
}
