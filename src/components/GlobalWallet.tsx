import { GlobalWalletAction } from "./GlobalWalletAction";
import {
  CircleDollarSign,
  Copy,
  FileCode2,
  MinusCircle,
  Pencil,
  PlusCircle,
  SquareArrowOutUpRight,
  Unlink,
} from "lucide-react";
import { toast } from "./Toast";
import Image from "next/image";
import { encodeFunctionData, Hex } from "viem";
import { useStrawberrySdk } from "@/strawberry-sdk";
import { useAccount, useBalance } from "wagmi";
import { baseSepolia } from "viem/chains";
import clsx from "clsx";
import { Pill } from "./Pill";
import { NFT_ABI, NFT_ADDRESS } from "@/utils/constants";
import { useState } from "react";

export const GlobalWalletInfo = () => {
  const { signMessage, signTypedData, sendTransaction, logout } =
    useStrawberrySdk();
  const { address } = useAccount();
  const [mintHash, setMintHash] = useState<Hex | undefined>(undefined);

  return (
    <div className="p-6 gap-8 flex flex-col border border-[#e2e3f0] rounded-lg w-fit">
      <div className="flex flex-col gap-6">
        <div className="text-lg font-medium">Account settings</div>
        <div className="flex flex-col gap-2">
          <button
            className="px-2 py-2 gap-2 flex flex-row items-center hover:bg-gray-50 rounded-md w-[360px]"
            onClick={async () => {
              const result = await sendTransaction({
                to: NFT_ADDRESS,
                data: encodeFunctionData({
                  abi: NFT_ABI,
                  functionName: "mint",
                  args: [address],
                }),
              });
              setMintHash(result);
              toast.success("Successfully minted NFT!");
            }}
          >
            <CircleDollarSign size={16} />
            <div className="font-medium">Mint NFT</div>
            {/* <Pill text="SPONSORED" color="#F1F2F9" bg="#64668B" /> */}
            {!!mintHash && (
              <SquareArrowOutUpRight
                size={16}
                className="ml-auto hover:text-[#64668B] p-30"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `https://sepolia.basescan.org/tx/${mintHash}`;
                }}
              />
            )}
          </button>
          <GlobalWalletAction
            icon={<PlusCircle size={16} />}
            label="Add session key"
            onClick={() => {
              toast.info(
                <>
                  Reach out to us at{" "}
                  <a href="mailto:support@privy.io">support@privy.io</a> to
                  learn more about our session key support!
                </>
              );
            }}
          />
          <GlobalWalletAction
            icon={<MinusCircle size={16} />}
            label="Revoke session key"
            onClick={() => {
              toast.info(
                <>
                  Reach out to us at{" "}
                  <a href="mailto:support@privy.io">support@privy.io</a> to
                  learn more about our session key support!
                </>
              );
            }}
          />
          <div className="h-[1px] bg-[#E2E3F0]"></div>
          <GlobalWalletAction
            icon={<Pencil size={16} />}
            label="Sign message"
            onClick={async () => {
              const hash = await signMessage("Hello, world!");
              toast.success(
                `Successfully signed message with hash: ${formatHex(
                  hash,
                  6,
                  6
                )}`
              );
            }}
          />
          <GlobalWalletAction
            icon={<FileCode2 size={16} />}
            label="Sign typed data"
            onClick={async () => {
              const hash = await signTypedData({
                types: {
                  EIP712Domain: [
                    { name: "name", type: "string" },
                    { name: "version", type: "string" },
                  ],
                  Person: [
                    { name: "name", type: "string" },
                    { name: "wallet", type: "address" },
                  ],
                },
                primaryType: "Person",
                domain: {
                  name: "Ether Mail",
                  version: "1",
                },
                message: {
                  name: "Cow",
                  wallet: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
                },
              });
              toast.success(
                `Successfully signed typed data with hash: ${formatHex(
                  hash,
                  6,
                  6
                )}`
              );
            }}
          />
          <GlobalWalletAction
            icon={<Unlink size={16} />}
            label="Disconnect"
            onClick={() => {
              logout();
              toast.success("Successfully disconnected your ecosystem wallet!");
            }}
          />
        </div>
        <div className="flex flex-col gap-3">
          <WalletCard />
        </div>
      </div>
      <a
        className="flex flex-row justify-center cursor-pointer"
        href="https://privy.io"
      >
        <Image
          src="./protected-by-privy.svg"
          height="12"
          width="142"
          alt="privy"
        />
      </a>
    </div>
  );
};
const WalletCard = () => {
  const { address } = useAccount();
  const balance = useBalance({
    address: address!,
    chainId: baseSepolia.id,
  });

  return (
    <div
      className={clsx(
        "flex flex-row justify-between border border-[#E2E3F0] rounded-xl px-4 py-3 items-center"
      )}
    >
      <div className="flex flex-col">
        <div className="text-[#64668B] text-xs font-medium">Your wallet</div>
        <div className="flex flex-row items-center gap-1 text-sm font-medium">
          <div>{formatHex(address!)}</div>
          <Copy
            size={14}
            className="cursor-pointer text-[#64668B] hover:text-[#000000]"
            onClick={() => {
              navigator.clipboard.writeText(address!);
              toast.success("Copied wallet address to clipboard");
            }}
          />
        </div>
      </div>
      <Pill
        text={`${balance.data?.formatted} ${balance.data?.symbol}`}
        color="#64668B"
        bg="#F1F2F9"
      />
    </div>
  );
};

export const formatHex = (hex: Hex, firstN = 4, lastN = 4): string => {
  const first = hex.slice(2, 2 + firstN);
  const last = hex.slice(hex.length - lastN, hex.length);
  return `0×${first}...${last}`;
};
