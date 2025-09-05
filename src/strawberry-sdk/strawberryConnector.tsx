import { toPrivyWalletConnector } from "@privy-io/cross-app-connect/rainbow-kit";
import { STRAWBERRY_APP_ID } from "./constants";

export const strawberryConnector = () => {
  return toPrivyWalletConnector({
    id: STRAWBERRY_APP_ID, // The Privy app id of provider application
    name: "Strawberry Fields", // The name of the provider application
    iconUrl: "https://privy-assets-public.s3.amazonaws.com/strawberry.png",
    // smartWalletMode: true,
  });
};
