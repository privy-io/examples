"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import {
  FarcasterWithMetadata,
  useFarcasterSigner,
  usePrivy,
} from "@privy-io/react-auth";
import {
  ExternalEd25519Signer,
  HubRestAPIClient,
} from "@standard-crypto/farcaster-js";
import axios from "axios";

import Section from "@/components/reusables/section";
import Accordion from "@/components/reusables/accordion";
import { showErrorToast, showSuccessToast } from "@/components/ui/custom-toast";

const Farcaster = () => {
  const { user } = usePrivy();
  const {
    requestFarcasterSignerFromWarpcast,
    signFarcasterMessage,
    getFarcasterSignerPublicKey,
  } = useFarcasterSigner();

  const [castTextInput, setCastTextInput] = useState("Hello World!");
  const [userCasts, setUserCasts] = useState<any>(null);

  const privySigner = new ExternalEd25519Signer(
    signFarcasterMessage,
    getFarcasterSignerPublicKey
  );
  const hubClient = new HubRestAPIClient({
    hubUrl: "https://hub-api.neynar.com",
    axiosInstance: axios.create({
      headers: {
        api_key: process.env.NEXT_PUBLIC_NEYNAR_KEY || "NEYNAR_PRIVY_DEMO",
      },
    }),
  });
  const farcasterAccount = user?.linkedAccounts.find(
    (account) => account.type === "farcaster"
  ) as FarcasterWithMetadata;
  const fid = farcasterAccount?.fid;
  const signerPublicKey = farcasterAccount?.signerPublicKey;

  const handleRequestFarcasterSigner = async () => {
    try {
      await requestFarcasterSignerFromWarpcast();
      showSuccessToast("Farcaster signer successfully registered.");
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to request Farcaster signer");
    }
  };

  const handleMakeCast = async () => {
    try {
      if (!fid) {
        showErrorToast("No Farcaster account found");
        return;
      }

      if (!signerPublicKey) {
        showErrorToast(
          "No signer public key found. Please request a signer first."
        );
        return;
      }

      const { hash } = await hubClient.submitCast(
        {
          text: castTextInput,
        },
        fid,
        privySigner
      );
      showSuccessToast(`Successfully casted, hash ${hash.slice(1, 10)}...`);
    } catch (error) {
      console.error("Cast submission error:", error);
      showErrorToast("Failed to make a cast");
    }
  };

  const handleFollowAccount = async () => {
    if (!fid) {
      showErrorToast("Cannot follow @privy");
      return;
    }
    try {
      const { hash } = await hubClient.followUser(188926, fid, privySigner);
      showSuccessToast(`Followed @privy successfully: ${hash.slice(1, 10)}...`);
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to follow @privy");
    }
  };
  const handleUnfollowAccount = async () => {
    if (!fid) {
      showErrorToast("Cannot unfollow @privy");
      return;
    }
    try {
      const { hash } = await hubClient.unfollowUser(188926, fid, privySigner);
      showSuccessToast(
        `Unfollowed @privy successfully: ${hash.slice(1, 10)}...`
      );
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to unfollow @privy");
    }
  };
  const availableActions = [
    {
      name: "Request Farcaster signer",
      function: handleRequestFarcasterSigner,
      disabled:
        !user?.linkedAccounts.find((account) => account.type === "farcaster") ||
        !!user?.linkedAccounts.find((account) => account.type === "farcaster")
          ?.signerPublicKey,
    },
    {
      name: "Make a cast",
      function: handleMakeCast,
      disabled: !user?.linkedAccounts.find(
        (account) => account.type === "farcaster"
      )?.signerPublicKey,
    },
    {
      name: "Follow @privy",
      function: handleFollowAccount,
      disabled: !user?.linkedAccounts.find(
        (account) => account.type === "farcaster"
      )?.signerPublicKey,
    },
    {
      name: "Unfollow @privy",
      function: handleUnfollowAccount,
      disabled: !user?.linkedAccounts.find(
        (account) => account.type === "farcaster"
      )?.signerPublicKey,
    },
  ];
  useEffect(() => {
    const fetchUserCasts = async () => {
      try {
        const farcasterAccount = user?.linkedAccounts.find(
          (account) => account.type === "farcaster"
        );
        const fid = farcasterAccount?.fid;

        if (!fid) {
          showErrorToast("No Farcaster account linked");
          return;
        }

        const url = new URL(
          "https://api.neynar.com/v2/farcaster/feed/user/popular/"
        );
        url.searchParams.append("fid", fid.toString());

        const neynarResponse = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "x-api-key":
              process.env.NEXT_PUBLIC_NEYNAR_KEY || "NEYNAR_PRIVY_DEMO",
          },
        });

        if (!neynarResponse.ok) {
          throw new Error(`HTTP error! status: ${neynarResponse.status}`);
        }

        const data = await neynarResponse.json();
        setUserCasts(data);
      } catch (error) {
        console.log(error);
        showErrorToast("Failed to fetch user casts");
      }
    };

    const farcasterAccount = user?.linkedAccounts.find(
      (account) => account.type === "farcaster"
    );
    if (farcasterAccount?.fid) {
      fetchUserCasts();
    }
  }, [user]);

  return (
    <Section
      name="Farcaster"
      description={
        "Request Farcaster signer to write to your Farcaster account and perform actions like cast, follow, etc."
      }
      filepath="src/components/sections/farcaster"
      actions={availableActions}
    >
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">Cast text</label>
        <input
          value={castTextInput}
          onChange={(e) => setCastTextInput(e.target.value)}
          placeholder="Hi from Privy demo!"
          className="w-full px-3 py-2 border border-[#E2E3F0] rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      {userCasts && (
        <div className="mt-6">
          <Accordion title={`User Casts (${userCasts.casts?.length || 0})`}>
            {userCasts.casts?.map((cast: any, index: number) => (
              <div
                key={cast.hash || index}
                className="bg-white border border-gray-200 rounded-lg p-4 mb-3 last:mb-0"
              >
                <div className="flex items-start space-x-3">
                  <Image
                    src={cast.author?.pfp_url}
                    alt={cast.author?.display_name}
                    className="w-10 h-10 rounded-full"
                    width="50"
                    height={"50"}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-sm">
                        {cast.author?.display_name}
                      </span>
                      <span className="text-gray-500 text-sm">
                        @{cast.author?.username}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {new Date(cast.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mb-2">{cast.text}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>💬 {cast.replies?.count || 0}</span>
                      <span
                        className="cursor-pointer"
                        onClick={async () => {
                          if (!fid) return;
                          const { hash } = await hubClient.submitReaction(
                            {
                              type: "recast",
                              target: {
                                hash: cast.hash,
                                fid: cast.author.fid,
                              },
                            },
                            fid,
                            privySigner
                          );
                          showSuccessToast(
                            `Recasted successfully: ${hash.slice(1, 10)}...`
                          );
                        }}
                      >
                        🔄 {cast.recasts?.count || 0}
                      </span>
                      <span
                        className="cursor-pointer"
                        onClick={async () => {
                          if (!fid) return;
                          const { hash } = await hubClient.submitReaction(
                            {
                              type: "like",

                              target: {
                                hash: cast.hash,
                                fid: cast.author.fid,
                              },
                            },
                            fid,
                            privySigner
                          );
                          showSuccessToast(
                            `Liked cast successfully: ${hash.slice(1, 10)}...`
                          );
                        }}
                      >
                        ❤️ {cast.reactions?.likes?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Accordion>
        </div>
      )}
    </Section>
  );
};

export default Farcaster;
