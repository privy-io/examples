"use client";

import React, { useEffect, useState } from "react";
import {
  useLogin,
  usePrivy,
  useSendTransaction,
  useSignMessage,
} from "@privy-io/react-auth";
import {
  createClient,
  type VerifiedTransactionRequest,
} from "@privy-io/cross-app-provider/connect";

/**
 * Demo page showcasing cross-app transaction utilities from @privy-io/cross-app-provider
 *
 * This page demonstrates:
 * - createClient(): Create a client with pre-filled analytics parameters
 * - client.getVerifiedTransactionRequest(): Load and decrypt transaction requests from URL parameters
 * - client.handleRequestResult(): Send successful transaction responses back to requester
 * - client.handleError(): Handle and communicate errors back to requester
 * - client.rejectRequest(): Reject transaction requests with pre-filled analytics parameters
 */

export default function TransactDemo() {
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const { login } = useLogin();
  const { signMessage } = useSignMessage();
  const { sendTransaction } = useSendTransaction();

  const [isLoading, setIsLoading] = useState(false);
  const [verifiedRequest, setVerifiedRequest] =
    useState<VerifiedTransactionRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create client instance with simplified configuration
  const client = createClient({
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || "",
    privyDomain: "https://privy.cross-app-provider-demo.privy.dev",
  });

  useEffect(() => {
    /**
     * Load and verify wallet request using getVerifiedTransactionRequest()
     * This function parses URL parameters and decrypts the transaction request
     */
    const loadRequest = async () => {
      if (!authenticated || !user?.id) {
        return;
      }

      try {
        setError(null);
        console.log("🔄 Loading and verifying wallet request...");

        // Demonstrate client.getVerifiedTransactionRequest() - parses and decrypts transaction data
        // This will automatically populate the client's analytics parameters
        const verified = await client.getVerifiedTransactionRequest({
          userId: user.id,
        });

        setVerifiedRequest(verified);
        console.log("✅ Verified wallet request:", verified);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load request";
        setError(errorMessage);
        console.error("❌ Failed to load request:", err);

        // Demonstrate handleError() usage when request verification fails
        try {
          const accessToken = await getAccessToken();
          if (accessToken) {
            client.handleError({
              accessToken,
              error: err as Error,
              callbackUrl: verifiedRequest?.connection.callbackUrl,
            });
          }
        } catch (handleErrorErr) {
          console.error("Failed to send error response:", handleErrorErr);
        }
      }
    };

    if (ready && authenticated && user?.id) {
      loadRequest();
    }
  }, [ready, authenticated, user?.id]);

  // Show loading screen while Privy initializes
  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Privy...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-purple-600"
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
            ⚡ Transaction demo
          </h1>
          <p className="text-gray-600 mb-6">
            Please log in to process transactions.
          </p>
          <button
            onClick={login}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  /**
   * Handle transaction signature using Privy's signMessage hook
   * Then send success response using handleRequestResult()
   */
  const handleSign = async () => {
    if (!verifiedRequest) return;

    setIsLoading(true);
    setError(null);

    const message = verifiedRequest.request.params[0] as string;
    try {
      console.log("🔄 Signing message:", message);

      // Sign the message using Privy's signMessage hook
      const { signature } = await signMessage({ message });
      console.log("✅ Message signed:", signature);

      // Demonstrate client.handleRequestResult() - sends encrypted success response back to requester
      const accessToken = await getAccessToken();
      if (accessToken) {
        await client.handleRequestResult({
          accessToken,
          result: signature, // The signed message
          connection: verifiedRequest.connection,
        });
      }

      console.log("✅ Success response sent to requester");

      // Show success feedback
      setError(null);
    } catch (err) {
      console.error("❌ Transaction failed:", err);

      // Demonstrate client.handleError() when signing fails
      try {
        const accessToken = await getAccessToken();
        if (accessToken) {
          await client.handleError({
            accessToken,
            error: err as Error,
            callbackUrl: verifiedRequest.connection.callbackUrl,
          });
        }
      } catch (handleErrorErr) {
        console.error("Failed to send error response:", handleErrorErr);
      }

      setError(err instanceof Error ? err.message : "Transaction failed");
    }

    setIsLoading(false);
  };

  const handleSendTransaction = async () => {
    if (!verifiedRequest) return;

    try {
      const { hash } = await sendTransaction({
        to: verifiedRequest.request.params[0] as string,
        value: verifiedRequest.request.params[1] as string,
      });
      console.log("✅ Transaction sent:", hash);

      const accessToken = await getAccessToken();
      if (accessToken) {
        await client.handleRequestResult({
          accessToken,
          result: hash,
          connection: verifiedRequest.connection,
        });
      }
    } catch (err) {
      console.error("❌ Transaction failed:", err);

      // Handle error using client
      const accessToken = await getAccessToken();
      if (accessToken) {
        await client.handleError({
          accessToken,
          error: err as Error,
          callbackUrl: verifiedRequest.connection.callbackUrl,
        });
      }

      setError(err instanceof Error ? err.message : "Transaction failed");
    }
  };

  /**
   * Handle transaction rejection using rejectRequest()
   * This sends a rejection response back to the requester
   */
  const handleReject = async () => {
    if (!verifiedRequest) return;

    try {
      console.log("🔄 Rejecting transaction request");

      // Demonstrate client.rejectRequest() - sends rejection response to requester
      const accessToken = await getAccessToken();
      if (accessToken) {
        await client.rejectRequest({
          accessToken,
          callbackUrl: verifiedRequest.connection.callbackUrl,
        });
      }

      console.log("✅ Rejection sent to requester");
    } catch (err) {
      console.error("❌ Failed to send rejection:", err);
      setError("Failed to reject transaction");
    }
  };

  const handleRequest = () => {
    if (verifiedRequest) {
      if (verifiedRequest.request.method === "personal_sign") {
        handleSign();
      } else if (verifiedRequest.request.method === "eth_sendTransaction") {
        handleSendTransaction();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ⚡ Transaction demo
          </h1>
          <p className="text-gray-600">
            Demonstrating @privy-io/cross-app-provider SDK
          </p>
        </div>

        {/* User Info */}
        <div className="bg-purple-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-purple-900 mb-2">Your account</h3>
          <div className="space-y-1 text-sm text-purple-800">
            <div>
              <strong>User:</strong>{" "}
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

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">⚠️ {error}</p>
          </div>
        )}

        {/* Loading State */}
        {!verifiedRequest && !error && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transaction request...</p>
          </div>
        )}

        {/* Verified request Display */}
        {verifiedRequest && (
          <>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Transaction request
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-gray-700">From:</strong>
                  <p className="text-gray-600">
                    {verifiedRequest.connection.callbackUrl}
                  </p>
                </div>

                <div>
                  <strong className="text-gray-700">Request type:</strong>
                  <p className="text-gray-600">
                    {verifiedRequest.request.method}
                  </p>
                </div>
                {verifiedRequest.request.params && (
                  <div>
                    <strong className="text-gray-700">Parameters:</strong>
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(verifiedRequest.request.params, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-gray-700 mb-2">
                Do you want to sign this request?
              </p>
              <p className="text-xs text-gray-500">
                This will use your connected wallet to create a signature.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mb-6">
              <button
                onClick={handleReject}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={handleRequest}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Signing..." : "Sign message"}
              </button>
            </div>
          </>
        )}

        {/* SDK Usage Documentation */}
        <div className="pt-4 border-t border-gray-200">
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700 mb-2">
              SDK functions demonstrated
            </summary>
            <div className="space-y-2 text-xs">
              <div>
                <strong>getVerifiedTransactionRequest():</strong> Parses and
                decrypts transaction requests from URL parameters
              </div>
              <div>
                <strong>handleRequestResult():</strong> Sends encrypted success
                response (signature) back to requester
              </div>
              <div>
                <strong>handleError():</strong> Sends error responses when
                signing fails
              </div>
              <div>
                <strong>rejectRequest():</strong> Sends rejection response to
                requester
              </div>
            </div>

            <details className="mt-2">
              <summary className="cursor-pointer hover:text-gray-700">
                Debug info
              </summary>
              <div className="mt-2 space-y-2">
                <div>
                  <strong>Raw URL parameters:</strong>
                  <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(verifiedRequest?.request, null, 2)}
                  </pre>
                </div>
                {verifiedRequest && (
                  <div>
                    <strong>Verified request:</strong>
                    <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(verifiedRequest, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          </details>
        </div>
      </div>
    </div>
  );
}
