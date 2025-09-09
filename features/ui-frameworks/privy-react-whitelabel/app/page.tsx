'use client';
import {usePrivy} from '@privy-io/react-auth';
import {useRouter} from 'next/navigation';
import Login from './components/Login';
import Wallets from './components/Wallets';

export default function Home() {
  const {ready} = usePrivy();
  if (!ready) {
    return <div></div>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="text-center p-4 rounded-lg">
        <p className="text-2xl font-bold mb-2">Privy whitelabel starter repo</p>
        <p className="status-text w-1/2 mx-auto">
          Privy SDKs are directly available so you can fully control all interfaces for
          authentication, embedded wallets, and user management. You can get started with fully
          customized interfaces by forking our{' '}
          <a href="https://github.com/privy-io/whitelabel-starter" className="link">
            whitelabel starter repo.
          </a>{' '}
          For more information about Privy, please visit our{' '}
          <a href="https://www.privy.io" target="_blank" rel="noopener noreferrer" className="link">
            website
          </a>{' '}
          and{' '}
          <a
            href="https://docs.privy.io"
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            docs
          </a>
          .
        </p>
      </div>

      <div className="flex flex-col md:flex-row w-full">
        <div className="w-full md:w-1/2">
          <Login />
        </div>
        <div className="w-full md:w-1/2">
          <Wallets />
        </div>
      </div>
    </div>
  );
}
