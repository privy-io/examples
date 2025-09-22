import { ArrowRightIcon, ArrowUpRightIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

interface HeaderProps {
  authenticated: boolean;
}

export function Header({ authenticated }: HeaderProps) {
  return (
    <header
      className={`fixed top-0 left-0 w-full h-[60px] flex flex-row justify-between items-center px-6 z-50 ${
        authenticated
          ? "bg-white border-b border-[#E2E3F0]"
          : "bg-transparent border-none backdrop-blur-none"
      }`}
    >
      <div className="flex flex-row items-center gap-2 h-[26px]">
        <Image
          src={
            authenticated ? "./privy-logo-black.svg" : "./privy-logo-white.svg"
          }
          alt="Privy Logo"
          width={104}
          height={23}
          className="w-[103.48px] h-[23.24px]"
          priority
        />

        {authenticated && (
          <div
            className={`text-medium flex h-[22px] items-center justify-center rounded-[11px] border px-[0.375rem] text-[0.75rem] ${
              authenticated
                ? "border-primary text-primary"
                : "border-white text-white"
            }`}
          >
            Next.js Demo
          </div>
        )}
      </div>

      <div className="flex flex-row justify-end items-center gap-4 h-9">
        <a
          className={`flex flex-row items-center gap-1 cursor-pointer ${
            authenticated ? "text-primary" : "text-white"
          }`}
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
  );
}
