import { useLogin, usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { FullScreenLoader } from "../components/ui/fullscreen-loader";
import { Header } from "../components/ui/header";

export default function LoginPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin({
    // Navigate the user to the dashboard after logging in
    onComplete: () => router.push("/dashboard"),
  });

  if (!ready) {
    return <FullScreenLoader />;
  }

  return (
    <>
      <Head>
        <title>Login · Privy</title>
      </Head>

      <main className="flex min-h-screen min-w-full">
        <Header authenticated={authenticated} />
        <section className="w-full flex flex-row justify-center items-center h-screen relative">
          <Image
            src="./BG.svg"
            alt="Background"
            fill
            style={{ objectFit: "cover", zIndex: 0 }}
            priority
          />
          <div className="z-10 flex flex-col items-center justify-center w-full h-full">
            <div className="flex h-10 items-center justify-center rounded-[20px] border border-white px-6 text-lg text-white font-abc-favorit">
              Next.js Demo
            </div>
            <div className="text-center mt-4 text-white text-7xl font-medium font-abc-favorit leading-[81.60px]">
              Starter repo
            </div>
            <div className="text-center text-white text-xl font-normal leading-loose mt-8">
              Get started developing with Privy using our Next.js starter repo
            </div>
            <button
              className="bg-white text-brand-off-black mt-15 w-full max-w-md rounded-full px-4 py-2 hover:bg-gray-100 lg:px-8 lg:py-4 lg:text-xl"
              onClick={() => {
                login();
                setTimeout(() => {
                  (
                    document.querySelector(
                      'input[type="email"]',
                    ) as HTMLInputElement
                  )?.focus();
                }, 150);
              }}
            >
              Get started
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
