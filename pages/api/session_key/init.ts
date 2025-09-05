import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthorizedUser } from '../../../lib/authorization';
import { privyServerClient } from '../../../lib/privy';
import { toRemoteSigner, RemoteSignerMode } from "@zerodev/remote-signer";
import { toECDSASigner } from "@zerodev/permissions/signers"


const ZERODEV_SECRET = process.env.ZERODEV_SECRET as string;
const ZERODEV_REMOTE_SIGNER_ADDRESS = process.env.ZERODEV_REMOTE_SIGNER_ADDRESS as `0x${string}`;

export type APIResponse = {
    session_key_address: string
}

export type APIError = {
    error: string;
    cause?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<APIResponse | APIError>) {
    const userId = await getAuthorizedUser(req);
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
    }


    const remoteSigner = await toRemoteSigner({
        apiKey: ZERODEV_SECRET,
        keyAddress: ZERODEV_REMOTE_SIGNER_ADDRESS,
        mode: RemoteSignerMode.Get
    });

    const sessionKeySigner = toECDSASigner({
        signer: remoteSigner,
    });

    const sessionKeyAddress = sessionKeySigner.account.address;
    res.status(200).json({session_key_address: sessionKeyAddress});
    return;
}
