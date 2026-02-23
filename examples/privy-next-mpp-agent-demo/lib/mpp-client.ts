import { Mppx, tempo } from 'mppx/client';
import { toAccount } from 'viem/accounts';
import { keccak256 } from 'viem';
import { getPrivyClient } from './privy';

/**
 * Create a viem-compatible account that delegates signing to Privy.
 *
 * Tempo transactions use a custom format with `calls` arrays instead of
 * standard EVM `to`/`data`. The account's `signTransaction` method handles
 * this by using the Tempo serializer to produce the unsigned payload,
 * signing the hash via Privy's raw secp256k1 endpoint, and then
 * re-serializing with the signature attached.
 */
function createPrivyAccount(walletId: string, address: `0x${string}`) {
  /**
   * Sign a raw hash using Privy's secp256k1 signing.
   * Returns the signature as a hex string.
   */
  async function signHash(hash: `0x${string}`): Promise<`0x${string}`> {
    const result = await getPrivyClient()
      .wallets()
      .ethereum()
      .signSecp256k1(walletId, {
        params: { hash },
      });
    return result.signature as `0x${string}`;
  }

  return toAccount({
    address,
    async signMessage({ message }) {
      const result = await getPrivyClient()
        .wallets()
        .ethereum()
        .signMessage(walletId, {
          message: typeof message === 'string' ? message : message.raw,
        });
      return result.signature as `0x${string}`;
    },
    async signTransaction(transaction, options) {
      // Tempo transactions use a custom serializer passed via options.
      // We serialize unsigned → hash → sign via Privy → re-serialize with signature.
      const serializer = options?.serializer;
      if (serializer) {
        // Tempo path: serialize → keccak256 → sign → re-serialize with sig
        const unsignedSerialized = await serializer(transaction);
        const hash = keccak256(unsignedSerialized);
        const signature = await signHash(hash as `0x${string}`);

        // Import SignatureEnvelope dynamically to parse the signature
        const { SignatureEnvelope } = await import('ox/tempo');
        const envelope = SignatureEnvelope.from(signature);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (await serializer(transaction, envelope as any)) as `0x${string}`;
      }

      // Fallback for standard EVM transactions (shouldn't happen on Tempo)
      throw new Error(
        'Standard EVM signTransaction not supported - use Tempo chain serializer'
      );
    },
    async signTypedData(typedData) {
      const result = await getPrivyClient()
        .wallets()
        .ethereum()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .signTypedData(walletId, { params: typedData as any });
      return result.signature as `0x${string}`;
    },
  });
}

/**
 * Execute an MPP payment request using Privy wallet for signing.
 */
export async function executeMppRequest(
  walletId: string,
  address: `0x${string}`,
  url: string,
  options?: RequestInit
): Promise<Response> {
  const account = createPrivyAccount(walletId, address);
  const mppx = Mppx.create({
    polyfill: false,
    methods: [tempo({ account })],
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const headers = new Headers(options?.headers);
    if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
      headers.set(
        'x-vercel-protection-bypass',
        process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      );
    }
    const response = await mppx.fetch(url, {
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
