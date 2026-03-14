import { erc20Abi, parseUnits, encodeFunctionData } from 'viem';
import { getPrivyClient } from './privy';
import { getNetworkConfig } from './network';

/**
 * Fund an agent wallet with PathUSD from the treasury
 */
export async function fundAgentWallet(
  agentAddress: `0x${string}`,
  amountUsd: number
): Promise<{ hash: string }> {
  const treasuryWalletId = process.env.TREASURY_WALLET_ID;
  const config = getNetworkConfig();

  if (!treasuryWalletId) {
    throw new Error('TREASURY_WALLET_ID not configured');
  }

  // Convert USD to PathUSD base units (6 decimals)
  // Add a small buffer for gas fees (Tempo uses PathUSD for gas)
  const gasBuffer = 0.01; // $0.01 buffer for gas
  const amount = parseUnits((amountUsd + gasBuffer).toFixed(6), 6);

  // Encode the transfer call
  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: 'transfer',
    args: [agentAddress, amount],
  });

  // Send transaction using Privy's wallet API
  const result = await getPrivyClient()
    .wallets()
    .ethereum()
    .sendTransaction(treasuryWalletId, {
      caip2: config.caip2,
      params: {
        transaction: {
          to: config.pathUsdContract,
          data,
          value: '0x0',
        },
      },
    });

  return { hash: result.hash };
}
