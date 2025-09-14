"use client";

import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import UserInfo from "@/components/user-info";
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import SendTransactionButton from "@/components/send-transaction-button";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useLoginToMiniApp } from "@privy-io/react-auth/farcaster";
import miniappSdk from "@farcaster/miniapp-sdk";

const Home = () => {
  const { ready, authenticated, login, logout } = usePrivy();
  const { initLoginToMiniApp, loginToMiniApp } = useLoginToMiniApp();
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const { wallets } = useWallets();
  // an effect to ensure if we are in mini app context
  useEffect(() => {
    if (miniappSdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      miniappSdk.actions.ready();
    }
  }, [isSDKLoaded]);

  // here we handle the login user automatically with farcaster (removes the need for the user to click the login button, can be removed if you want to use the login button)
  // when you open in TBA, if the user has added their TBA wallet to their farcaster account as an verified auth address, they will be logged in automatically
  // change this useEffect to your needs
  useEffect(() => {
    if (ready && !authenticated) {
      const login = async () => {
        // Initialize a new login attempt to get a nonce for the Farcaster wallet to sign
        const { nonce } = await initLoginToMiniApp();
        // Request a signature from Farcaster
        const result = await miniappSdk.actions.signIn({ nonce: nonce });
        // Send the received signature from Farcaster to Privy for authentication
        // or pass a SIWF message signed by an auth address
        await loginToMiniApp({
          message: result.message,
          signature: result.signature,
        });
      };
      login();
    }
  }, [ready, authenticated]);

  if (!ready) {
    return <FullScreenLoader />;
  }
  return (
    <div className="flex flex-col gap-4 ">
      <h1 className="text-2xl font-bold text-center">
        Privy Farcaster Miniapp Demo
      </h1>
      {wallets[0] && (
        <div className="text-sm text-gray-500 text-center">
          Connected Wallet: {wallets[0].address.slice(0, 6)}...
          {wallets[0].address.slice(-4)}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {authenticated ? (
          <div className="flex flex-col gap-2">
            <UserInfo /> <SendTransactionButton />
            <Button onClick={logout} variant="secondary">
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-fit mx-auto">
            <Button onClick={login}>Login</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
