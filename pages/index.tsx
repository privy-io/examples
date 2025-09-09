import Portal from '../components/graphics/portal';
import {
  useLogin,
} from '@privy-io/react-auth';
import Head from 'next/head';
import {useRouter} from 'next/router';

export default function LoginPage() {
  const router = useRouter();

  const {login} = useLogin({
    onComplete() {
      router.push('/dashboard');
    },
  });

  return (
    <>
      <Head>
        <title>Privy Account Abstraction Example with Session Keys</title>
      </Head>

      <main className="min-h-[100svh] w-full bg-privy-light-blue p-6">
        <div className="flex justify-center w-full pt-6">
          <Portal style={{maxWidth: '100%', height: 'auto'}} />
        </div>
        <div className="mt-6 flex flex-col md:flex-row flex-wrap justify-center gap-2 text-center">
          <button
            className="rounded-lg bg-violet-600 py-3 px-6 text-white hover:bg-violet-700"
            onClick={() => login()}
          >
            Log in
          </button>
        </div>
      </main>
    </>
  );
}
