import { privyServerClient } from "./privy";
import { NextApiRequest } from "next";




export const getAuthorizedUser = async (req: NextApiRequest): Promise<string | null> => {
    const header = req.headers.authorization;
    console.log({header});
    if (typeof header !== 'string') {
        return null;
    }
    const authToken = header.replace(/^Bearer /, '');

    let verifiedClaims;
    try {
        verifiedClaims = await privyServerClient.verifyAuthToken(authToken);
        return verifiedClaims.userId
    } catch {
        return null;
    }
}