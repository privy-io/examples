/**
 * Direct x402 settlement without a facilitator.
 *
 * Implements EIP-3009 (transferWithAuthorization) verification and on-chain settlement.
 * Flow: Client signs EIP-712 message → Server verifies → Server submits transaction
 */

import {
  verifyTypedData,
  createPublicClient,
  http,
  encodeFunctionData,
  type Hex,
  type Address,
} from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { getNetworkConfig, NETWORK_MODE } from './network';
import { getPrivyClient } from './privy';

const EIP3009_ABI = [
  {
    name: 'transferWithAuthorization',
    type: 'function',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
] as const;

const TRANSFER_WITH_AUTHORIZATION_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
} as const;

interface PaymentPayload {
  x402Version: number;
  payload: {
    authorization: {
      from: Address;
      to: Address;
      value: string;
      validAfter: string;
      validBefore: string;
      nonce: Hex;
    };
    signature: Hex;
  };
  accepted: {
    scheme: string;
    network: string;
    amount: string;
    payTo: Address;
    asset: Address;
    extra?: { name?: string; version?: string };
  };
}

export interface PaymentRequirements {
  scheme: string;
  network: string;
  amount: string;
  resource: string;
  payTo: string;
  asset?: string;
  maxTimeoutSeconds?: number;
  extra?: Record<string, unknown>;
}

function getPublicClient() {
  const config = getNetworkConfig();
  return createPublicClient({
    chain: NETWORK_MODE === 'mainnet' ? base : baseSepolia,
    transport: http(config.rpcUrl),
  });
}

function parsePaymentSignature(paymentSignature: string): PaymentPayload {
  try {
    return JSON.parse(Buffer.from(paymentSignature, 'base64').toString('utf8'));
  } catch {
    return JSON.parse(paymentSignature);
  }
}

async function verifyPaymentSignature(payload: PaymentPayload): Promise<{ valid: boolean; error?: string }> {
  const config = getNetworkConfig();
  const auth = payload.payload.authorization;

  const domain = {
    name: config.usdcDomainName,
    version: config.usdcDomainVersion,
    chainId: BigInt(config.chainIdNumber),
    verifyingContract: config.usdcContract,
  };

  const message = {
    from: auth.from,
    to: auth.to,
    value: BigInt(auth.value),
    validAfter: BigInt(auth.validAfter),
    validBefore: BigInt(auth.validBefore),
    nonce: auth.nonce,
  };

  try {
    const isValid = await verifyTypedData({
      address: auth.from,
      domain,
      types: TRANSFER_WITH_AUTHORIZATION_TYPES,
      primaryType: 'TransferWithAuthorization',
      message,
      signature: payload.payload.signature,
    });

    return isValid ? { valid: true } : { valid: false, error: 'Invalid signature' };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Signature verification failed' };
  }
}

function validatePayment(payload: PaymentPayload, requirements: PaymentRequirements): { valid: boolean; error?: string } {
  const config = getNetworkConfig();
  const auth = payload.payload.authorization;
  const now = Math.floor(Date.now() / 1000);

  if (auth.value !== requirements.amount) {
    return { valid: false, error: `Amount mismatch: expected ${requirements.amount}, got ${auth.value}` };
  }
  if (auth.to.toLowerCase() !== requirements.payTo.toLowerCase()) {
    return { valid: false, error: `Recipient mismatch: expected ${requirements.payTo}, got ${auth.to}` };
  }
  if (payload.accepted.network !== config.chainId) {
    return { valid: false, error: `Network mismatch: expected ${config.chainId}, got ${payload.accepted.network}` };
  }
  if (BigInt(auth.validBefore) <= BigInt(now)) {
    return { valid: false, error: 'Payment authorization has expired' };
  }
  if (BigInt(auth.validAfter) > BigInt(now)) {
    return { valid: false, error: 'Payment authorization is not yet valid' };
  }

  return { valid: true };
}

async function submitSettlement(payload: PaymentPayload): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const config = getNetworkConfig();
  const treasuryWalletId = process.env.TREASURY_WALLET_ID;
  const auth = payload.payload.authorization;

  if (!treasuryWalletId) {
    return { success: false, error: 'Settlement wallet (TREASURY_WALLET_ID) not configured' };
  }

  const data = encodeFunctionData({
    abi: EIP3009_ABI,
    functionName: 'transferWithAuthorization',
    args: [
      auth.from,
      auth.to,
      BigInt(auth.value),
      BigInt(auth.validAfter),
      BigInt(auth.validBefore),
      auth.nonce,
      payload.payload.signature,
    ],
  });

  try {
    const result = await getPrivyClient().wallets().ethereum().sendTransaction(
      treasuryWalletId,
      {
        caip2: config.chainId,
        params: {
          transaction: {
            to: config.usdcContract,
            data,
            value: '0x0',
          },
        },
      }
    );

    const publicClient = getPublicClient();
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: result.hash as Hex,
      confirmations: 1,
    });

    if (receipt.status === 'reverted') {
      return { success: false, error: 'Transaction reverted on-chain' };
    }

    return { success: true, txHash: result.hash };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Settlement submission failed' };
  }
}

/**
 * Verify and settle an x402 payment directly on-chain (no facilitator).
 *
 * @param paymentSignature - The X-PAYMENT header value (base64 or JSON)
 * @param requirements - The payment requirements to validate against
 * @returns Settlement result with transaction hash on success
 */
export async function verifyAndSettleDirect(
  paymentSignature: string,
  requirements: PaymentRequirements
): Promise<{ valid: boolean; txHash?: string; error?: string }> {
  try {
    const payload = parsePaymentSignature(paymentSignature);
    const auth = payload.payload.authorization;

    // Use the actual recipient from the signed payload
    const actualRequirements = { ...requirements, payTo: auth.to };

    const validation = validatePayment(payload, actualRequirements);
    if (!validation.valid) {
      return { valid: false, error: validation.error };
    }

    const verification = await verifyPaymentSignature(payload);
    if (!verification.valid) {
      return { valid: false, error: verification.error };
    }

    const settlement = await submitSettlement(payload);
    if (!settlement.success) {
      return { valid: false, error: settlement.error };
    }

    return { valid: true, txHash: settlement.txHash };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Direct settlement failed' };
  }
}
