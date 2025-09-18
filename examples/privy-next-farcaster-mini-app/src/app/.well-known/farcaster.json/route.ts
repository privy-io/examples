import { appUrl } from "@/app/layout";
import { NextResponse } from "next/server";

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: "",
      payload: "",
      signature: "",
    },
    miniapp: {
      name: "Privy Farcaster Miniapp Demo",
      version: "0.0.1",
      iconUrl: `${appUrl}/privy-favicon.png`,
      homeUrl: appUrl,
      splashImageUrl: `${appUrl}/privy-favicon.png`,
      splashBackgroundColor: "#000000",
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
