// FILE ALTERED FROM CANONICAL STARTER
"use client";

import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import Section from "../reusables/section";
import { showErrorToast, showSuccessToast } from "../ui/custom-toast";
import { base, mainnet } from "viem/chains";
import { encodeFunctionData, erc20Abi } from "viem";

const EVMSmartWalletActions = () => {
  const { client, getClientForChain } = useSmartWallets();
  const signMessageHandler = () => {
    if (!client) {
      showErrorToast("Smart wallet client not initialised.");
      return;
    }
    try {
      client.signMessage({ message: "Hello, world!" }).then((signature) => {
        showSuccessToast(`Message signed: ${signature.slice(0, 10)}...`);
      });
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to sign message.");
    }
  };

  const sendTransactionHandler = () => {
    if (!client) {
      showErrorToast("Smart wallet client not initialised.");
      return;
    }
    try {
      client
        .sendTransaction({
          chain: base,
          to: "0x0",
          value: BigInt(1),
        })
        .then((txHash) => {
          showSuccessToast(`Transaction sent: ${txHash.slice(0, 10)}...`);
        });
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to send transaction.");
    }
  };

  const signTypedDataHandler = async () => {
    if (!client) {
      showErrorToast("Smart wallet client not initialised.");
      return;
    }
    try {
      const typedData = {
        domain: {
          name: "Example App",
          version: "1",
          chainId: 1,
          verifyingContract:
            "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC" as `0x${string}`,
        },
        types: {
          Person: [
            { name: "name", type: "string" },
            { name: "wallet", type: "address" },
          ],
          Mail: [
            { name: "from", type: "Person" },
            { name: "to", type: "Person" },
            { name: "contents", type: "string" },
          ],
        },
        primaryType: "Mail" as const,
        message: {
          from: {
            name: "Cow",
            wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
          },
          to: {
            name: "Bob",
            wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
          },
          contents: "Hello, Bob!",
        },
      };

      client.signTypedData(typedData).then((signature) => {
        showSuccessToast(`Typed data signed: ${signature.slice(0, 10)}...`);
      });
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to sign typed data.");
    }
  };

  const batchTransactionHandler = async () => {
    if (!client) {
      showErrorToast("Smart wallet client not initialised.");
      return;
    }
    try {
      const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // USDC on Base Sepolia

      client
        .sendTransaction({
          calls: [
            // Approve transaction
            {
              to: USDC_ADDRESS,
              data: encodeFunctionData({
                abi: erc20Abi,
                functionName: "approve",
                args: [
                  "0xaFF06818d5BFaBdFe0278f60d656C4ea8f9A8967",
                  BigInt(1e6),
                ],
              }),
            },
            // Transfer transaction
            {
              to: USDC_ADDRESS,
              data: encodeFunctionData({
                abi: erc20Abi,
                functionName: "transfer",
                args: [
                  "0xaFF06818d5BFaBdFe0278f60d656C4ea8f9A8967",
                  BigInt(1e6),
                ],
              }),
            },
          ],
        })
        .then((txHash) => {
          showSuccessToast(`Batch transaction sent: ${txHash.slice(0, 10)}...`);
        });
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to send batch transaction.");
    }
  };

  const switchChainHandler = async () => {
    if (!client) {
      showErrorToast("Smart wallet client not initialised.");
      return;
    }
    try {
      const mainnetClient = await getClientForChain({
        id: mainnet.id,
      });
      // use mainnetClient to send transactions now
      // mainnetClient.sendTransaction({)
      showSuccessToast("Chain switched successfully to ethereum");
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to switch chain.");
    }
  };

  const availableActions = [
    {
      name: "Sign message",
      function: signMessageHandler,
    },
    {
      name: "Send transaction",
      function: sendTransactionHandler,
    },
    {
      name: "Sign typed data",
      function: signTypedDataHandler,
    },
    {
      name: "Send batch transaction",
      function: batchTransactionHandler,
    },
    {
      name: "Switch chain",
      function: switchChainHandler,
    },
  ];

  return (
    <Section
      name="EVM Smart Wallet Actions"
      description={"Sign messages, typed data, send and batch transactions."}
      filepath="src/components/sections/evm-smart-wallet-actions"
      actions={availableActions}
    />
  );
};

export default EVMSmartWalletActions;
