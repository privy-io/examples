import { NextRequest, NextResponse } from "next/server";
import {
  createZeroDevPaymasterClient,
  createKernelAccountClient,
} from "@zerodev/sdk";
import { http, createPublicClient, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { toECDSASigner } from "@zerodev/permissions/signers";
import {
  deserializePermissionAccount,
} from "@zerodev/permissions";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";

export async function POST(request: NextRequest) {
  console.log("API route called: /api/execute-session-transaction");

  try {
    const { sessionKeyPrivateKey, approval } = await request.json();

    console.log("Received request data:", {
      hasSessionKey: !!sessionKeyPrivateKey,
      hasApproval: !!approval
    });

    if (!sessionKeyPrivateKey || !approval) {
      console.error("Missing required fields");
      return NextResponse.json(
        { error: "Missing sessionKeyPrivateKey or approval" },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_ZERODEV_RPC) {
      console.error("ZERODEV_RPC not configured");
      return NextResponse.json(
        { error: "ZeroDev RPC not configured" },
        { status: 500 }
      );
    }

    console.log("Using ZeroDev RPC:", process.env.NEXT_PUBLIC_ZERODEV_RPC);

    const publicClient = createPublicClient({
      transport: http(process.env.NEXT_PUBLIC_ZERODEV_RPC),
      chain: baseSepolia, // Using Base Sepolia to match your RPC
    });

    const entryPoint = getEntryPoint("0.7");

    // Server recreates the session key signer
    const serverSessionSigner = privateKeyToAccount(sessionKeyPrivateKey);
    const sessionKeySigner = await toECDSASigner({
      signer: serverSessionSigner,
    });

    // Deserialize the approved session key account
    const sessionKeyKernelAccount = await deserializePermissionAccount(
      publicClient,
      entryPoint,
      KERNEL_V3_1,
      approval,
      sessionKeySigner
    );

    const kernelPaymaster = createZeroDevPaymasterClient({
      chain: baseSepolia,
      transport: http(process.env.NEXT_PUBLIC_ZERODEV_RPC),
    });

    const kernelClient = createKernelAccountClient({
      account: sessionKeyKernelAccount,
      chain: baseSepolia,
      bundlerTransport: http(process.env.NEXT_PUBLIC_ZERODEV_RPC),
      paymaster: kernelPaymaster,
    });

    // Server executes transaction autonomously
    const userOpHash = await kernelClient.sendUserOperation({
      callData: await sessionKeyKernelAccount.encodeCalls([
        {
          to: zeroAddress,
          value: BigInt(0),
          data: "0x",
        },
      ]),
    });

    const receipt = await kernelClient.waitForUserOperationReceipt({
      hash: userOpHash,
    });

    return NextResponse.json({
      success: true,
      userOpHash,
      transactionHash: receipt.receipt.transactionHash,
    });

  } catch (error) {
    console.error("Server error executing transaction:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        error: "Server transaction failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}