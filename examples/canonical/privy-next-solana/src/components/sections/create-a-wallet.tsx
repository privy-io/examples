"use client";

import { useSolanaWallets } from "@privy-io/react-auth";
import Section from "../reusables/section";
import { showSuccessToast, showErrorToast } from "../ui/custom-toast";

const CreateAWallet = () => {
  const { createWallet: createWalletSolana } = useSolanaWallets();

  const createWalletSolanaHandler = async () => {
    try {
      await createWalletSolana({
        createAdditional: true,
      });
      showSuccessToast("Solana wallet created successfully.");
    } catch (error) {
      console.log(error);
      showErrorToast("Solana wallet creation failed.");
    }
  };

  const availableActions = [
    {
      name: "Create Solana wallet",
      function: createWalletSolanaHandler,
    },
  ];

  return (
    <Section
      name="Create a wallet"
      description={
        "Creates a new Solana wallet for the user. To limit to a single wallet per user, remove the createAdditional flag from createWallet"
      }
      filepath="src/components/sections/create-a-wallet"
      actions={availableActions}
    />
  );
};

export default CreateAWallet;