"use client";

import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from "@heroicons/react/16/solid";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  authenticated: boolean;
  onLogout?: () => void;
}

export function Header({ authenticated, onLogout }: HeaderProps) {
  const pathname = usePathname();
  return (
    <header
      className={`fixed top-0 left-0 w-full h-[60px] flex flex-row justify-between items-center px-6 z-50 ${
        authenticated
          ? "bg-white border-b border-[#E2E3F0]"
          : "bg-transparent border-none backdrop-blur-none"
      }`}
    >
      <div className="flex flex-row items-center gap-4 h-[26px]">
        <Image
          src={authenticated ? "./privy-logo-black.svg" : "./privy-logo-white.svg"}
          alt="Privy Logo"
          width={104}
          height={23}
          className="w-[103.48px] h-[23.24px]"
          priority
        />

        {authenticated && (
          <div
            className="font-medium flex h-[22px] items-center justify-center rounded-[11px] border px-[0.375rem] text-[0.75rem] border-primary text-primary"
          >
            Yield Demo
          </div>
        )}

        {authenticated && onLogout && (
          <button
            onClick={onLogout}
            className="flex flex-row items-center gap-2 px-4 py-1.5 text-sm font-medium text-[#64668B] hover:text-[#040217] bg-white border border-[#E2E3F0] rounded-full cursor-pointer transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" strokeWidth={2} />
            Logout
          </button>
        )}
      </div>

      {authenticated && (
        <nav className="flex flex-row items-center gap-1">
          <Link
            href="/dashboard"
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              pathname === "/dashboard"
                ? "bg-[#F1F2F9] text-[#040217]"
                : "text-[#64668B] hover:text-[#040217]"
            }`}
          >
            User
          </Link>
          <Link
            href="/app-dashboard"
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              pathname === "/app-dashboard"
                ? "bg-[#F1F2F9] text-[#040217]"
                : "text-[#64668B] hover:text-[#040217]"
            }`}
          >
            App
          </Link>
        </nav>
      )}

      <div className="flex flex-row justify-end items-center gap-4 h-9">
        <a
          className={`flex flex-row items-center gap-1 text-sm font-medium cursor-pointer ${
            authenticated ? "text-primary" : "text-white"
          }`}
          href="https://docs.privy.io/recipes/yield-guide"
          target="_blank"
          rel="noreferrer"
        >
          Docs <ArrowUpRightIcon className="h-4 w-4" strokeWidth={2} />
        </a>

        {!authenticated && (
          <button className="button-primary rounded-full hidden md:block">
            <a
              className="flex flex-row items-center gap-2"
              href="https://dashboard.privy.io/"
              target="_blank"
              rel="noreferrer"
            >
              <span>Go to dashboard</span>
              <ArrowRightIcon className="h-4 w-4" strokeWidth={2} />
            </a>
          </button>
        )}
      </div>
    </header>
  );
}
