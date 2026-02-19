import { erc20Abi, parseUnits, encodeFunctionData } from 'viem';
import { getPrivyClient } from './privy';
import { getNetworkConfig } from './network';

/**
 * Fund an agent wallet with USDC from the treasury
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

  // Convert USD to USDC base units (6 decimals)
  const amount = parseUnits(amountUsd.toString(), 6);

  // Encode the transfer call
  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: 'transfer',
    args: [agentAddress, amount],
  });

  // Send transaction using Privy's wallet API
  // method and chain_type are set internally
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

  return { hash: result.hash };
}
