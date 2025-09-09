import type {NextApiRequest, NextApiResponse} from 'next';
import { getAuthorizedUser } from '../../../lib/authorization';
import { privyServerClient } from '../../../lib/privy';

export type APIError = {
  error: string;
  cause?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<null | APIError>) {
  const userId = await getAuthorizedUser(req);

  if (!userId) {
    res.status(401).json({error: 'Unauthorized.'});
    return;
  }

  if (req.method !== 'DELETE') {
    res.status(404).json({error: 'Not found'});
    return;
  }

  try {
    await privyServerClient.deleteUser(userId);
  } catch (error) {
    return res.status(500).json({error: 'Unable to delete user.'});
  }
  return res.status(204).end();
}
