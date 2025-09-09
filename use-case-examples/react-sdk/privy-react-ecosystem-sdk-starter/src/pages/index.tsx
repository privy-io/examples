import Image from "next/image";
import localFont from "next/font/local";
import { Inter } from "next/font/google";

import { AppToaster } from "@/components/Toast";
import { StrawberryWalletProvider } from "@/strawberry-sdk";
import { InteractiveHome } from "@/components/InteractiveHome";
import { InfoCards } from "@/components/InfoCards";

const abcFavorit = localFont({
  src: "./fonts/ABCFavoritExtendedVariable-Trial.ttf",
  variable: "--font-abc-favorit",
  weight: "100 900",
});

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <StrawberryWalletProvider>
      <div
        className={`${abcFavorit.variable} ${inter.className} items-center justify-items-center min-h-screen p-10 sm:p-20 font-[family-name:var(--font-geist-sans)]`}
      >
        <AppToaster />
        <main className="flex flex-col md:flex-row gap-8 row-start-2 items-center sm:items-start justify-around w-full">
          <div className="flex flex-col w-[415px] gap-6 md:w-full">
            <div className="flex flex-col w-[220px]">
              <Image
                src="/strawberry.png"
                alt="Strawberry Logo"
                width={100}
                height={100}
              />
              <h1 className="font-favorit font-bold text-5xl">
                Strawberry Fields
              </h1>
            </div>
            <h4 className="text-balance font-medium text-md mt-3 max-w-[600px] mb-3">
              Privy makes it easy to provision your own ecosystem wallet. Create
              an ecosystem login for every developer on your app/chain, and make
              it easily reusable across the web.
            </h4>
            <InteractiveHome />
          </div>
          <InfoCards />
        </main>
      </div>
    </StrawberryWalletProvider>
  );
}
