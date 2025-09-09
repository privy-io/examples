import { FRAME_BASE_URL } from '@/lib/farcaster';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<Response> {
    return NextResponse.redirect(FRAME_BASE_URL, {status: 302});
}

export const dynamic = 'force-dynamic';