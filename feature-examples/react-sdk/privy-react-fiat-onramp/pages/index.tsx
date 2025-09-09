import Portal from "../components/graphics/PortalGraphic";
import { useLogin } from "@privy-io/react-auth";
import Head from "next/head";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useLogin({
    onComplete: () => {
      router.push("/home");
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return (
    <>
      <Head>
        <title>Login · Privy</title>
      </Head>
      <main className="flex min-h-screen min-w-[100vw]">
        <div className="flex flex-1 items-center justify-center bg-privy-light-blue p-6">
          <div>
            <div>
              <Portal style={{ maxWidth: "100%", height: "auto" }} />
            </div>
            <div className="mt-6 flex justify-center text-center">
              <button
                className="rounded-lg bg-violet-600 py-3 px-6 text-white hover:bg-violet-700"
                onClick={login}
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
