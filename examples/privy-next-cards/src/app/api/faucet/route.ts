import { NextResponse } from "next/server";

import { TEMPO_TESTNET } from "@/chains";

/**
 * Moderato's faucet is a JSON-RPC method on the chain's own endpoint rather than a separate service,
 * so funding a test wallet is one call with no API key. Mainnet has no equivalent — this is testnet
 * only, which is why the route hardcodes the testnet RPC instead of taking a chain from the caller.
 */
const TEMPO_TESTNET_RPC = TEMPO_TESTNET.rpcUrls.default.http[0];

/** Proxied through a route handler because the RPC endpoint does not send CORS headers for browsers. */
export async function POST(request: Request) {
  let address: unknown;
  try {
    ({ address } = await request.json());
  } catch {
    return NextResponse.json({ error: "Expected a JSON body" }, { status: 400 });
  }

  // The faucet takes the address as-is, so a malformed one comes back as an opaque RPC error. Check
  // the shape here to say something useful instead.
  if (typeof address !== "string" || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json(
      { error: "Expected `address` to be a 0x-prefixed 20-byte address" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(TEMPO_TESTNET_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tempo_fundAddress",
        // Lowercased: the faucet is documented as taking a lowercase address.
        params: [address.toLowerCase()],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Faucet RPC returned ${response.status}` },
        { status: 502 },
      );
    }

    // A JSON-RPC error arrives with HTTP 200 and an `error` member, so the status check above is not
    // enough on its own.
    const body = await response.json();
    if (body.error) {
      return NextResponse.json(
        { error: body.error.message ?? "Faucet RPC call failed" },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not reach the faucet",
      },
      { status: 502 },
    );
  }
}
