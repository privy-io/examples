"use client";

import { ChevronDown } from "lucide-react";
import type React from "react";
import { Button } from "./ui/button";
import { Dropdown, DropdownItem } from "./ui/dropdown";
import { ConnectedStandardSolanaWallet } from "@privy-io/react-auth/solana";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  wallets: ConnectedStandardSolanaWallet[];
  onWalletSelect: (wallet: ConnectedStandardSolanaWallet) => void;
}

export function ActionButton({
  icon,
  label,
  wallets,
  onWalletSelect,
}: ActionButtonProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const trigger = (
    <Button variant="outline" className="gap-2">
      {icon}
      {label}
      <ChevronDown className="h-4 w-4" />
    </Button>
  );

  return (
    <Dropdown trigger={trigger}>
      <div className="py-1">
        {wallets?.map((wallet, index) => (
          <DropdownItem
            key={`${wallet.address}-${index}`}
            onClick={() => onWalletSelect(wallet)}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium text-white">
                  {wallet.standardWallet.name}
                </span>
                <span className="text-sm text-gray-400">
                  {formatAddress(wallet.address)}
                </span>
              </div>
            </div>
          </DropdownItem>
        ))}
      </div>
    </Dropdown>
  );
}
