'use client';
import {useLoginWithPasskey, useSignupWithPasskey} from '@privy-io/react-auth';

const Passkey = () => {
  const {loginWithPasskey} = useLoginWithPasskey();
  const {signupWithPasskey} = useSignupWithPasskey();
  return (
    <div className="grid grid-cols-2 gap-3">
      <button onClick={() => signupWithPasskey()} className="btn">
        <div className="btn-text">Signup with Passkey</div>
      </button>
      <button onClick={() => loginWithPasskey()} className="btn">
        <div className="btn-text">Login with Passkey</div>
      </button>
    </div>
  );
};

export default Passkey;
