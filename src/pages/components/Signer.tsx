"use client";

import Wrapper from "./Wrapper";
import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { useWalletClient } from "wagmi";

const Signer = () => {
  const publicClient = usePublicClient();
  const { data: walletClient, isError, isLoading } = useWalletClient();

  const [chainId, setChainId] = useState<string | null>(null);
  const [transactionCount, setTransactionCount] = useState<string | null>(null);

  const ready =
    chainId && transactionCount && walletClient && !isLoading && !isError;

  useEffect(() => {
    if (!walletClient) return;

    walletClient?.getChainId().then((chainId) => {
      setChainId(chainId.toString());
    });
    publicClient
      ?.getTransactionCount({ address: walletClient.account.address })
      .then((transactionCount) => {
        setTransactionCount(transactionCount.toString());
      });
  }, [walletClient, publicClient]);

  if (isError) {
    return (
      <Wrapper title="useSigner">
        <p>Error getting signer.</p>
      </Wrapper>
    );
  } else if (!ready) {
    return (
      <Wrapper title="useSigner">
        <p>Loading...</p>
      </Wrapper>
    );
  } else {
    return (
      <Wrapper title="useSigner">
        <p>Chain ID: {chainId}</p>
        <p>Transaction Count: {transactionCount}</p>
      </Wrapper>
    );
  }
};

export default Signer;
