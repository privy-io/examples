"use client";

import {
  Config,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
  useSwitchChain,
  useChainId,
} from "wagmi";
import {mainnet, base} from "wagmi/chains";
import Section from "../reusables/section";
import { showSuccessToast, showErrorToast } from "@/components/ui/custom-toast";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import { SendTransactionVariables } from "wagmi/query";

const WalletActions = () => {
  const currentChain = useChainId();
  const { switchChain } = useSwitchChain({
    mutation: {
        onSuccess: (data) => {
            showSuccessToast(`Chain switched to ${data.name}`);
        },
        onError: (error) => {
            showErrorToast(`Failed to switch chain: ${error.message}`);
        },
    }
  });

  const { signMessage } = useSignMessage({
    mutation: {
      onSuccess: (data) => {
        showSuccessToast(`EVM Message signed: ${data.slice(0, 10)}...`);
      },
    },
  });
  const { sendTransaction } = useSendTransaction({
    mutation: {
      onSuccess: (data) => {
        showSuccessToast(`EVM Transaction sent: ${data.slice(0, 20)}...`);
      },
    },
  });
  const { signTypedData } = useSignTypedData({
    mutation: {
      onSuccess: (data) => {
        showSuccessToast(`Typed Data signed: ${data.slice(0, 10)}...`);
      },
    },
  });

  const selectedWallet = useAccount();

  const handleSignMessageEvm = async () => {
    if (!selectedWallet.address) {
      showErrorToast("Please select an Ethereum wallet");
      return;
    }
    try {
      const message = "Hello, world!";
      await signMessage({
        message,
        account: selectedWallet.address,
      });
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to sign EVM message");
    }
  };

  const handleSendTransactionEvm = async () => {
    if (!selectedWallet.address) {
      showErrorToast("Please select an Ethereum wallet");
      return;
    }
    try {
      const transactionRequest: SendTransactionVariables<Config, number> = {
        to: "0xF2A919977c6dE88dd8ed90feAADFcC5d65D66038" as `0x${string}`,
        value: parseEther("0.001"),
        type: "eip1559",
      };
      await sendTransaction(transactionRequest);
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to send EVM transaction");
    }
  };

  const handleSignTypedData = async () => {
    if (!selectedWallet.address) {
      showErrorToast("Please select an Ethereum wallet");
      return;
    }
    try {
      // All properties on a domain are optional
      const domain = {
        name: "Ether Mail",
        version: "1",
        chainId: selectedWallet.chain?.id,
        verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      } as const;

      // The named list of all type definitions
      const types = {
        Person: [
          { name: "name", type: "string" },
          { name: "wallet", type: "address" },
        ],
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person" },
          { name: "contents", type: "string" },
        ],
      } as const;

      const message = {
        from: {
          name: "Cow",
          wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
        },
        to: {
          name: "Bob",
          wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
        },
        contents: "Hello, Bob!",
      } as const;

      await signTypedData({
        primaryType: "Mail",
        domain,
        types,
        message,
      });
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to sign typed data");
    }
  };

  const handleSwitchToBaseChainEvm = async () => {
    await switchChain({ chainId: base.id });
  };

  const handleSwitchToMainnetChainEvm = async () => {
    await switchChain({ chainId: mainnet.id });
  };

  const availableActions = [
    {
      name: "Sign message (EVM)",
      function: handleSignMessageEvm,
    },
    {
      name: "Sign typed data (EVM)",
      function: handleSignTypedData,
    },
    {
      name: "Send transaction (EVM)",
      function: handleSendTransactionEvm,
    },
    {
      name: "Switch to Base chain (EVM)",
      function: handleSwitchToBaseChainEvm,
      disabled: currentChain === base.id,
    },
    {
      name: "Switch to Mainnet chain (EVM)",
      function: handleSwitchToMainnetChainEvm,
      disabled: currentChain === mainnet.id,
    },
  ];

  return (
    <Section
      name="Wagmi wallet actions"
      description={
        "Using Wagmi, we can sign messages, typed data, and send transactions creating a seamless experience across Privy embedded wallets and externally connected wallets."
      }
      filepath="src/components/sections/wagmi-wallet-actions"
      actions={availableActions}
    />
  );
};

export default WalletActions;
