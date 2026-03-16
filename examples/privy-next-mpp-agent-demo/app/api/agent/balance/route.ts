import { NextRequest, NextResponse } from 'next/server';
import { encodeFunctionData } from 'viem';
import { getNetworkConfig } from '@/lib/network';

const balanceOfAbi = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');
  if (!address) {
    return NextResponse.json(
      { success: false, error: 'Address is required' },
      { status: 400 }
    );
  }

  const config = getNetworkConfig();
  const data = encodeFunctionData({
    abi: balanceOfAbi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  });

  try {
    const response = await fetch(config.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{ to: config.pathUsdContract, data }, 'latest'],
        id: 1,
      }),
    });

    const json = await response.json();
    if (json.error) {
      throw new Error(json.error.message || 'RPC error');
    }

    // Parse the uint256 result (PathUSD has 6 decimals)
    const rawBalance = BigInt(json.result);
    const balanceCents = Number(rawBalance) / 10_000; // base units → cents

    return NextResponse.json({
      success: true,
      balance: balanceCents,
      raw: rawBalance.toString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch balance',
      },
      { status: 500 }
    );
  }
}
