'use client';

import Button from './Button';
import {shorten} from '../../lib/utils';
import {useAccount, useSignMessage} from 'wagmi';


const SignMessage = () => {
  const {address} = useAccount();
  const {data, isPending, isSuccess, isError, signMessage} = useSignMessage({
    mutation: {
      onSuccess: () => {
        console.log('Sign Message Success');
      },
    },
  });
  return (
    <>
      <h2 className="mt-6 text-2xl">useSignMessage</h2>
      <Button
        disabled={isPending}
        onClick_={() => {
          signMessage({
            account:address,
            message: `Signing with address: ${shorten(address)}`,
          });
        }}
        cta="Sign!"
      />
      {isSuccess && <div>Signature: {shorten(data)}</div>}
      {isError && <div>Error signing message</div>}
    </>
  );
};

export default SignMessage;
