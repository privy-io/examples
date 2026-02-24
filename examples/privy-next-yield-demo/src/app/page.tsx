'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import { ToastContainer } from 'react-toastify';

import { FullScreenLoader } from '@/components/ui/fullscreen-loader';
import { Header } from '@/components/ui/header';

export default function Home() {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/dashboard');
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return <FullScreenLoader />;
  }

  return (
    <div className="bg-transparent h-screen overflow-hidden">
      <Header authenticated={false} />

      <section className="w-full flex flex-row justify-center items-center h-screen relative">
        <Image
          src="./BG.svg"
          alt="Background"
          fill
          style={{ objectFit: "cover", zIndex: 0 }}
          priority
        />
        <div className="z-10 flex flex-col items-center justify-center w-full h-full">
          <div className="flex h-10 items-center justify-center rounded-[20px] border border-white px-6 text-lg text-white font-abc-favorit">
            Yield Demo
          </div>
          <div className="text-center mt-4 text-white text-7xl font-medium font-abc-favorit leading-[81.60px]">
            Privy Yield Demo
          </div>
          <div className="text-center text-white text-xl font-normal leading-loose mt-8 max-w-md">
            Allow users to earn yield on assets in wallets
          </div>
          <button
            className="bg-white text-brand-off-black mt-15 w-full max-w-md rounded-full px-4 py-2 hover:bg-gray-100 lg:px-8 lg:py-4 lg:text-xl cursor-pointer"
            onClick={() => {
              login();
            }}
          >
            Get started
          </button>
        </div>
      </section>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        limit={1}
        aria-label="Toast notifications"
        style={{ top: 58 }}
      />
    </div>
  );
}
