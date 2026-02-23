'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PrivyLogo, PrivyBlobby } from '@/components/PrivyLogo';

export default function Home() {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/dashboard');
    }
  }, [ready, authenticated, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Blobby background gradient */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className="w-[800px] h-[800px] rounded-full opacity-40"
          style={{
            background: 'radial-gradient(circle, #BECEF3 0%, transparent 70%)',
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Logo and blobby */}
        <div className="flex flex-col items-center gap-6">
          <PrivyBlobby className="w-20 h-24 text-[#5B4FFF]" />
          <h1 className="text-4xl font-semibold text-[#040217]">Privy Yield</h1>
          <p className="text-lg text-[#64668B] text-center max-w-md">
            Earn yield on your USDC with a simple deposit. 
            Powered by Morpho vaults on Base.
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <div className="badge-info flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>Earn Yield</span>
          </div>
          <div className="badge-info flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure</span>
          </div>
          <div className="badge-info flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Instant</span>
          </div>
        </div>

        {/* Login button */}
        <button
          onClick={login}
          disabled={!ready}
          className="btn-primary text-base px-8 py-3 mt-4"
        >
          {!ready ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </span>
          ) : (
            'Get Started'
          )}
        </button>

        {/* Footer note */}
        <p className="text-sm text-[#9498B8] mt-8">
          Connect your wallet or sign in with email to start earning
        </p>
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-8 flex items-center gap-2 text-[#9498B8]">
        <span className="text-sm">Powered by</span>
        <PrivyLogo className="h-5 w-auto" />
      </div>
    </main>
  );
}
