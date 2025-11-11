import { useState } from "react";
import {
  usePrivy,
  useWallets,
  useX402Fetch,
  decodeXPaymentResponse,
} from "@privy-io/react-auth";

export default function X402PaymentsExample() {
  const { authenticated, login, ready } = usePrivy();
  const { wallets } = useWallets();
  const { wrapFetchWithPayment } = useX402Fetch();

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentReceipt, setPaymentReceipt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchPaidContent() {
    setError(null);
    setResult(null);
    setPaymentReceipt(null);
    setIsLoading(true);

    try {
      // Wrap fetch to automatically handle x402 payments
      const fetchWithPayment = wrapFetchWithPayment({
        walletAddress: wallets[0]?.address,
        fetch,
        maxValue: BigInt(10000000), // Max 10 USDC
      });

      // Make request - will automatically handle 402 and payment
      const response = await fetchWithPayment("/api/weather");

      if (response.ok) {
        const data = await response.json();
        setResult(data);

        // Decode payment receipt if present
        const receiptHeader = response.headers.get("x-payment-response");
        if (receiptHeader) {
          const receipt = decodeXPaymentResponse(receiptHeader);
          setPaymentReceipt(receipt);
        }
      } else {
        setError(`Request failed: ${response.statusText}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            x402 Payments with Privy
          </h1>
          <p className="mb-6 text-gray-600">
            Demonstrate automatic HTTP 402 payments using Privy embedded wallets
            and the x402 protocol.
          </p>
          <button
            onClick={login}
            className="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
          >
            Login with Privy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          x402 Payments Example
        </h1>
        <p className="mb-8 text-gray-600">
          This example demonstrates automatic payments for API access using the
          x402 protocol and Privy embedded wallets.
        </p>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Test Payment Flow</h2>

          <div className="mb-6 rounded-md bg-blue-50 p-4 text-sm text-blue-800">
            <strong>How it works:</strong> Click the button below to fetch
            weather data. The API requires payment of 0.001 USDC. Privy will
            prompt you to sign the payment authorization, then the request
            automatically retries with payment.
          </div>

          <button
            onClick={fetchPaidContent}
            disabled={isLoading || !wallets[0]}
            className="w-full rounded-md bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 disabled:bg-gray-400"
          >
            {isLoading
              ? "Processing Payment..."
              : "Fetch Paid Weather Data (0.001 USDC)"}
          </button>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-4 space-y-4">
              <div className="rounded-md bg-green-50 p-4">
                <h3 className="font-semibold text-green-900">
                  Payment Successful!
                </h3>
                <p className="mt-2 text-sm text-green-800">
                  Weather: {result.report?.weather}, Temperature:{" "}
                  {result.report?.temperature}°F
                </p>
              </div>

              {paymentReceipt && (
                <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-2 font-semibold">Payment Receipt</h3>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-600">Transaction:</span>{" "}
                      <a
                        href={`https://sepolia.basescan.org/tx/${paymentReceipt.transaction}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-blue-600 hover:underline"
                      >
                        {paymentReceipt.transaction?.slice(0, 10)}...
                      </a>
                    </div>
                    <div>
                      <span className="text-gray-600">Network:</span>{" "}
                      {paymentReceipt.network}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-2 font-semibold text-gray-900">Resources</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>
              •{" "}
              <a
                href="https://x402.org"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                x402 Protocol
              </a>
            </li>
            <li>
              •{" "}
              <a
                href="https://docs.privy.io/recipes/x402"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privy x402 Recipe
              </a>
            </li>
            <li>
              •{" "}
              <a
                href="https://faucet.circle.com"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Testnet USDC
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
