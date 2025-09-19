"use client";

import React, { useEffect, useState } from "react";
import { useLogin, useLogout, usePrivy } from "@privy-io/react-auth";
import { createClient } from "@privy-io/cross-app-provider/auth";

/**
 * Demo page showcasing cross-app connection utilities from @privy-io/cross-app-provider
 *
 * This page demonstrates:
 * - createClient(): Create a client with pre-filled analytics parameters
 * - client.getConnectionRequestFromUrlParams(): Parse URL parameters for cross-app connections
 * - client.acceptConnection(): Accept a cross-app connection request
 * - client.rejectConnection(): Reject a connection request
 * - client.handleError(): Proper error handling and communication back to requester
 */

// Create client instance with simplified configuration
const client = createClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || "",
  privyDomain: "https://privy.cross-app-provider-demo.privy.dev",
});

type Req = Awaited<ReturnType<typeof client.getConnectionRequestFromUrlParams>>;

export default function ConnectDemo() {
  const { ready, user, getAccessToken } = usePrivy();

  const { login } = useLogin();
  const { logout } = useLogout({
    onSuccess: () => {
      console.log("User successfully logged out");
    },
  });

  const [req, setReq] = useState<Req | undefined>();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    client
      .getConnectionRequestFromUrlParams()
      .then(setReq)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <p className="text-gray-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  // Show loading screen while Privy initializes and the params are parsed
  if (!ready || !req) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Privy...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🔗 Cross-app connection demo
          </h1>
          <p className="text-gray-600 mb-6">
            Please log in to connect your account.
          </p>
          <button
            onClick={login}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  /**
   * Handle connection acceptance using acceptConnection() from cross-app-provider
   * This demonstrates the full connection acceptance flow
   */
  const handleAccept = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate required parameters

      // Get the access token from Privy
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Unable to get access token");
      }

      // Use client.acceptConnection() from @privy-io/cross-app-provider
      const res = await client.acceptConnection({
        accessToken,
        codeChallenge: req.codeChallenge!,
        codeChallengeMethod: req.codeChallengeMethod!,
        state: req.state,
        oauthClientId: req.oauthClientId,
      });

      console.log("✅ Connection accepted successfully", req);

      // Connection success redirect
      window.location.assign(res.location);
    } catch (error) {
      console.error("❌ Connection failed:", error);

      setError(error instanceof Error ? error.message : "Connection failed");
    }

    setIsLoading(false);
  };

  /**
   * Handle connection rejection using rejectConnection() from cross-app-provider
   * This demonstrates the connection rejection flow
   */
  const handleReject = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate required parameters

      // Get the access token from Privy
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Unable to get access token");
      }

      // Use client.rejectConnection() from @privy-io/cross-app-provider
      const res = await client.rejectConnection({
        accessToken,
        codeChallenge: req.codeChallenge!,
        codeChallengeMethod: req.codeChallengeMethod!,
        state: req.state,
        oauthClientId: req.oauthClientId,
      });

      console.log("✅ Connection rejected successfully", req);

      // Rejection success redirect
      window.location.assign(res.location);
    } catch (error) {
      console.error("❌ Connection failed:", error);

      setError(error instanceof Error ? error.message : "Connection failed");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🔗 Cross-app connection demo
          </h1>
          <p className="text-gray-600">
            Demonstrating @privy-io/cross-app-provider SDK
          </p>
        </div>

        {/* User Account Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-blue-900">Your account</h3>
            <button
              onClick={logout}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
              title="Switch account"
            >
              Logout
            </button>
          </div>
          <div className="space-y-1 text-sm text-blue-800">
            <div>
              <strong>Logged in as:</strong>{" "}
              {user?.email?.address ||
                user?.phone?.number ||
                `User ${user?.id.slice(0, 8)}...`}
            </div>
            {user?.wallet?.address && (
              <div className="font-mono text-xs">
                <strong>Wallet:</strong> {user.wallet.address}
              </div>
            )}
          </div>
        </div>

        {/* Connection Request Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">
            Connection request
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong>From:</strong> {req.oauthClientId || "Not specified"}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">⚠️ {error}</p>
          </div>
        )}

        <div className="text-center mb-6">
          <p className="text-gray-700">
            Allow this app to connect to your account?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => handleReject()}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Connecting..." : "Accept"}
          </button>
        </div>

        {/* SDK Usage Documentation */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700 mb-2">
              SDK functions demonstrated
            </summary>
            <div className="space-y-2 text-xs">
              <div>
                <strong>createClient():</strong> Creates a client with
                pre-filled analytics parameters for cleaner API calls
              </div>
              <div>
                <strong>client.getConnectionRequestFromUrlParams():</strong>{" "}
                Parses requester_public_key and requester_origin from URL
              </div>
              <div>
                <strong>client.acceptConnection():</strong> Accepts cross-app
                connection and sends encrypted response
              </div>
              <div>
                <strong>client.rejectConnection():</strong> Rejects connection
                request
              </div>
              <div>
                <strong>client.handleError():</strong> Sends error responses
                back to requester app
              </div>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer hover:text-gray-700">
                Debug info
              </summary>
              <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(req, null, 2)}
              </pre>
            </details>
          </details>
        </div>
      </div>
    </div>
  );
}
