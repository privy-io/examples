import { NextRequest, NextResponse } from "next/server";

const TEMPO_RPC_URL = "https://rpc.testnet.tempo.xyz";
const TEMPO_AUTH = Buffer.from("eng:zealous-mayer").toString("base64");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(TEMPO_RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${TEMPO_AUTH}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("RPC proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy RPC request" },
      { status: 500 }
    );
  }
}
