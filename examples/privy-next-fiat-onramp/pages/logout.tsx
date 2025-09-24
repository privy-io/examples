import Portal from "../components/graphics/PortalGraphic";
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const { logout } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    logout().then(() => {
      router.push("/");
    });
  }, [logout, router]);

  return (
    <>
      <Head>
        <title>Logout · Privy</title>
      </Head>

      <main className="flex min-h-screen min-w-full">
        <div className="flex flex-1 items-center justify-center bg-privy-light-blue p-6">
          <div>
            <div className="flex flex-col justify-center text-center">
              <Portal style={{ maxWidth: "100%", height: "auto" }} />
              <p>Logging out...</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
