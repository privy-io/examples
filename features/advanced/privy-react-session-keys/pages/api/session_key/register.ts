import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthorizedUser } from '../../../lib/authorization';
import { createDBClient } from '../../../lib/db';

export type APIResponse = {}

export type APIError = {
    error: string;
    cause?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<APIResponse | APIError>) {
    console.log("/session_key/register handler");
    const userId = await getAuthorizedUser(req);
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
    }
    console.log("/session_key/register userId", userId);

    const {session_key_approval: sessionKeyApproval} = req.body;
    
    console.log("/session_key/register req.body", req.body);

    if (typeof sessionKeyApproval !== 'string') {
        res.status(422).json({error: 'Invalid session key approval.'});
        return;
    }

    const db = createDBClient();

    const response = await db.from('SessionKeyApprovals').upsert({
        privy_did: userId,
        session_key_approval: sessionKeyApproval
    }).select();
    console.log("SessionKeyApprovals response", response);

    const {data, error} = response;
    if (error || !data) {
        res.status(422).json({error: error?.message});
        return;
    }

    return res.status(200).json({});
}
