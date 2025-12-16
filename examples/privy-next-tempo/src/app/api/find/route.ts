import { PrivyClient } from "@privy-io/node";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const privy = new PrivyClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  appSecret: process.env.PRIVY_APP_SECRET,
});

const findSchema = z.object({
  identifier: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = findSchema.parse(body);
    const { identifier } = payload;

    // Get or create user
    const user = await getUser(identifier);

    // Get user's wallet
    const wallet = user.linked_accounts?.find(
      (account) =>
        account.type === "wallet" && account.chain_type === "ethereum"
    );

    if (!wallet || !wallet.address) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      address: wallet.address,
      identifier,
      identifierType: identifier.includes("@") ? "email" : "phone",
      userId: user.id,
    });
  } catch (error) {
    console.error("Error in /api/find:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get a user by phone number or email by querying Privy's user management API
// If a user doesn't exist, a new user will be created.
async function getUser(identifier: string) {
  if (!identifier.includes("@")) {
    const user = await privy
      .users()
      .getByPhoneNumber({ number: identifier })
      .catch(() => null);
    if (user) return user;

    return privy.users().create({
      linked_accounts: [{ type: "phone", number: identifier }],
      wallets: [{ chain_type: "ethereum" }],
    });
  } else {
    const user = await privy
      .users()
      .getByEmailAddress({ address: identifier })
      .catch(() => null);
    if (user) return user;

    return privy.users().create({
      linked_accounts: [{ type: "email", address: identifier }],
      wallets: [{ chain_type: "ethereum" }],
    });
  }
}
