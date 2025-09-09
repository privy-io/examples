import type { NextApiRequest, NextApiResponse } from 'next';
import { createDBClient } from '../../../lib/db';
import { toECDSASigner } from "@zerodev/permissions/signers"
import { toRemoteSigner, RemoteSignerMode } from "@zerodev/remote-signer"
import { createPublicClient, http, parseEther } from "viem";
import { baseSepolia } from "viem/chains";
import { ENTRYPOINT_ADDRESS_V07 } from 'permissionless';
import { createKernelAccountClient } from "@zerodev/sdk";
import { deserializePermissionAccount } from "@zerodev/permissions";

export type APIResponse = {}

export type APIError = {
    error: string;
    cause?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<APIResponse | APIError>) {
    console.log("/session_key/rpc handler");

    // Authenticate this request with the MY_APP_BACKEND_ADMIN_TOKEN secret
    // as the basic auth password.
    const authHeader = req.headers.authorization?.replace('Basic ', '');
    const [, appSecret] = atob(authHeader as string).split(':');

    if (appSecret !== process.env.MY_APP_BACKEND_ADMIN_TOKEN) {
        res.status(401).json({ error: 'Invalid app secret.' });
        return;
    }

    // Check that the requested user has a registered approval already.
    const {user_id: userId} = req.body;

    const db = createDBClient();

    const response = await db.from('SessionKeyApprovals').select().eq('privy_did', userId);

    if (!response.data) {
        res.status(401).json({ error: 'No approval present.' });
        return;
    }

    const approval = response.data[0].session_key_approval;

    if (!approval) {
        res.status(401).json({ error: 'No approval present.' });
        return;
    }

    const remoteSigner = await toRemoteSigner({
        apiKey: process.env.ZERODEV_SECRET as string,
        keyAddress: process.env.ZERODEV_REMOTE_SIGNER_ADDRESS,
        mode: RemoteSignerMode.Get
    })
     
    const sessionKeySigner = toECDSASigner({
      signer: remoteSigner,
    })

    const publicClient = createPublicClient({
        transport: http(baseSepolia.rpcUrls.default.http[0]),
      })

    const sessionKeyAccount = await deserializePermissionAccount(
        publicClient,
        ENTRYPOINT_ADDRESS_V07,
        approval,
        sessionKeySigner
      )

    // Create a Kernel account client to send user operations from the smart account
    const kernelClient = createKernelAccountClient({
        account: sessionKeyAccount,
        chain: baseSepolia,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        bundlerTransport: http(process.env.NEXT_PUBLIC_ZERODEV_BUNDLER_URL),
    });

    // Example transaction.
    let transactionHash;
    try {
        transactionHash = await kernelClient.sendTransaction({
            to: "0x...",  // Replace with a destination wallet address.
            value: parseEther('1'),
        })
    } catch (error) {
        console.log("ERROR", error);
    }

    console.log("transactionHash", transactionHash);
    return res.status(200).json({
        transaction_hash: transactionHash,
    });
}
