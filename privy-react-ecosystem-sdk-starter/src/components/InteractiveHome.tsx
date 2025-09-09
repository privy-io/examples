import { ConnectionLoading, LoginWithStrawberry } from "@/strawberry-sdk/ui";
import { useAccount, useAccountEffect } from "wagmi";
import { GlobalWalletInfo } from "./GlobalWallet";
import { toast } from "./Toast";

export const InteractiveHome = () => {
  const { status } = useAccount();
  useAccountEffect({
    onConnect: () => {
      toast.success("Connected your Strawberry Fields wallet!");
    },
  });
  if (status === "disconnected") {
    return <LoginWithStrawberry />;
  }
  if (status === "reconnecting" || status === "connecting") {
    return <ConnectionLoading />;
  }
  return <GlobalWalletInfo />;
};
