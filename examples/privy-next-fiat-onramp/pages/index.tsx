import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";
import { ArrowUpRightIcon, ArrowRightIcon } from "@heroicons/react/16/solid";

export default function LoginPage() {
  const router = useRouter();
  const { ready, authenticated, login } = usePrivy();

  // Redirect to home if already authenticated
  if (ready && authenticated) {
    router.push("/home");
    return null;
  }

  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Fiat Onramp Demo · Privy</title>
      </Head>
      <div className="bg-transparent h-screen overflow-hidden">
        {/* Header */}
        <header className="fixed top-0 left-0 w-full h-[60px] flex flex-row justify-between items-center px-6 z-50 bg-transparent border-none backdrop-blur-none">
          <div className="flex flex-row items-center gap-2 h-[26px]">
            <Image
              src="./privy-logo-white.svg"
              alt="Privy Logo"
              width={104}
              height={23}
              className="w-[103.48px] h-[23.24px]"
              priority
            />
          </div>

          <div className="flex flex-row justify-end items-center gap-4 h-9">
            <a
              className="flex flex-row items-center gap-1 cursor-pointer text-white"
              href="https://docs.privy.io/basics/react/installation"
              target="_blank"
              rel="noreferrer"
            >
              Docs <ArrowUpRightIcon className="h-4 w-4" strokeWidth={2} />
            </a>

            <button className="button-primary rounded-full hidden md:block">
              <a
                className="flex flex-row items-center gap-2"
                href="https://dashboard.privy.io/"
                target="_blank"
                rel="noreferrer"
              >
                <span> Go to dashboard</span>
                <ArrowRightIcon className="h-4 w-4" strokeWidth={2} />
              </a>
            </button>
          </div>
        </header>

        {/* Main Content */}
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
              Fiat Onramp Demo
            </div>
            <div className="text-center mt-4 text-white text-7xl font-medium font-abc-favorit leading-[81.60px]">
              Fund with ease
            </div>
            <div className="text-center text-white text-xl font-normal leading-loose mt-8">
              Seamlessly purchase crypto with fiat using Privy&apos;s embedded wallet integration
            </div>
            <button
              className="bg-white text-[#040217] mt-15 w-full max-w-md rounded-full px-4 py-2 hover:bg-gray-100 lg:px-8 lg:py-4 lg:text-xl font-medium"
              onClick={() => {
                login();
                setTimeout(() => {
                  (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus();
                }, 150);
              }}
            >
              Get started
            </button>
          </div>
        </section>
      </div>
    </>
  );
}