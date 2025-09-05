import { errorFrame, parseFrameRequest, getOwnerAddressFromFid, successFrame } from '@/lib/farcaster';
import { FrameRequest } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { airdropTo } from '@/lib/nft';
import { createOrFindEmbeddedWalletForFid } from '@/lib/embedded-wallet';

export async function POST(req: NextRequest): Promise<Response> {
    let frameRequest: FrameRequest | undefined;
    // Parse and validate request from Frame for fid
    try {
        frameRequest = await req.json();
        if (!frameRequest) throw new Error('Could not deserialize request from frame');
    } catch (e) {
        return new NextResponse(errorFrame);
    }

    const {fid, isValid} = await parseFrameRequest(frameRequest);
    if (!fid || !isValid) return new NextResponse(errorFrame);
    
    const address = req.url.split('/').slice(-1)[0];
    if (typeof address !== 'string') return new NextResponse(errorFrame);
    
    // Airdrop NFT to the user's wallet
    const tx = await airdropTo(address as `0x${string}`);
    if (!tx) return new NextResponse(errorFrame);

    return new NextResponse(successFrame);
}

export const dynamic = 'force-dynamic';