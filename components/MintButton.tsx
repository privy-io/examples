import { DecentSDK, edition } from "@decent.xyz/sdk";
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useState } from "react";
import handleTxError from "../lib/handleTxError";


const MintButton = (props:any) => {
  const { ready, authenticated, user, linkWallet, getEthersProvider } = usePrivy();
  const [isMinting, setIsMinting] = useState(false);

  const onSigning = (isMinting:boolean) => {
    setIsMinting(isMinting || false);
  };

  const onSuccess = (receipt:any) => {
    if (receipt) setIsMinting(false);
  };

  const onSuccessfulMint = async (receipt:any) => {
    onSuccess?.(receipt);
    toast.success("Minted successfully. Please fill out form below to receive your physical goods!");
  }

  const mint = async () => {
    if (user?.wallet) {
      try {
        onSigning?.(true);
        const sdk = new DecentSDK(props.chainId, getEthersProvider().getSigner());
        const nftOne = await edition.getContract(sdk, props.contractAddress);
        const tx = await nftOne.mint(1, { value: ethers.utils.parseEther(props.price) }); //could add a state variable + input number type here to enable batch minting
        const receipt = await tx.wait();
        await onSuccessfulMint(receipt);
      } catch (error) {
        handleTxError(error);
        onSigning?.(false);
      }
    } else {
      toast.error("Please connect wallet to continue.");
      if (ready && authenticated) {
        linkWallet(); 
      }
    }
  }

  return (
    <button className="bg-violet-700 hover:bg-white hover:text-violet-700 px-5 py-1 rounded-full font-[500] w-full" onClick={mint}>{isMinting ? "..." : "Mint"}</button>
  );
};

export default MintButton;