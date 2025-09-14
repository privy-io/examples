import { PrivyClient } from "@privy-io/server-auth";
import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const privyAuthToken = cookieStore.get("privy-token");

  if (privyAuthToken) {
    const client = new PrivyClient(
      process.env.NEXT_PUBLIC_PRIVY_APP_ID as string,
      process.env.PRIVY_APP_SECRET as string,
    );

    try {
      await client.verifyAuthToken(privyAuthToken.value);
    } catch (e) {
      console.error(e);
      redirect("/", RedirectType.replace);
    }
  } else {
    redirect("/", RedirectType.replace);
  }

  return <>{children}</>;
}
