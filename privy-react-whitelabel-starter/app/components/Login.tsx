'use client';
import {useEffect, useState} from 'react';
import {useLoginWithEmail, useLoginWithSms, useGuestAccounts, usePrivy} from '@privy-io/react-auth';
import OAuth from './OAuth';
import Passkey from './Passkey';
import SIWE from './SIWE';
import TelegramLogin from './TelegramLogin';
import SIWS from './SIWS';

const Login = () => {
  const {createGuestAccount} = useGuestAccounts();
  const {ready, authenticated, logout} = usePrivy();

  /**
   * Logic for using whitelabel email auth
   *
   */
  const {
    sendCode: sendCodeEmail,
    loginWithCode: loginWithCodeEmail,
    state: stateEmail,
  } = useLoginWithEmail({
    onComplete: ({user, isNewUser, wasAlreadyAuthenticated, loginMethod}) => {
      console.log('🔑 ✅ User successfully logged in with email', {
        user,
        isNewUser,
        wasAlreadyAuthenticated,
        loginMethod,
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });

  // Email Local State
  const [email, setEmail] = useState('');
  const [codeEmail, setCodeEmail] = useState('');
  const [emailState, setEmailState] = useState(stateEmail.status as string);

  // Update email status
  useEffect(() => {
    if (stateEmail.status === 'error' && stateEmail.error) {
      const message = `Error ${stateEmail.error.message}`;
      setEmailState(message);
    } else {
      setEmailState(stateEmail.status);
    }
  }, [stateEmail]);

  /**
   * Logic for using whitelabel sms Auth
   */
  const {
    sendCode: sendCodeSms,
    loginWithCode: loginWithCodeSms,
    state: stateSms,
  } = useLoginWithSms({
    onComplete: ({user, isNewUser, wasAlreadyAuthenticated, loginMethod}) => {
      console.log('🔑 ✅ User successfully logged in with Sms', {
        user,
        isNewUser,
        wasAlreadyAuthenticated,
        loginMethod,
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });

  // Sms Local State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [codeSms, setCodeSms] = useState('');
  const [smsState, setSmsState] = useState(stateSms.status as string);

  useEffect(() => {
    if (stateSms.status === 'error' && stateSms.error) {
      const message = `Error ${stateSms.error.message}`;
      setSmsState(message);
    } else {
      setSmsState(stateSms.status);
    }
  }, [stateSms]);

  return (
    <div className="mx-4 px-4">
      <h1 className="text-2xl font-bold text-center my-4">Authentication</h1>
      <div className="text-center mt-4 mx-auto mb-4">
        <p className="status-text">
          Privy empowers your users to authenticate through multiple methods such as Email, SMS and
          OAuth, or begin with a guest account.
        </p>
      </div>
      <div className="mt-4 p-4">
        <div className="flex flex-col">
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                console.log('click');
                createGuestAccount();
              }}
              className="btn"
            >
              <div className="btn-text">Get started with a guest account</div>
            </button>
            {ready && authenticated && (
              <button onClick={logout} className="btn">
                <div className="btn-text text-black">Logout</div>
              </button>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4 text-left">Email</h2>
            <input
              className="input mb-2 flex-grow"
              placeholder="Enter email"
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <button
              onClick={() => sendCodeEmail({email})}
              className="btn wallet-button-primary mb-2"
              disabled={emailState === 'sending-code'}
            >
              <div className="btn-text">Send code</div>
            </button>
            <input
              className="input mb-2 flex-grow"
              placeholder="Enter OTP"
              onChange={(e) => setCodeEmail(e.currentTarget.value)}
            />
            <button
              onClick={() => loginWithCodeEmail({code: codeEmail})}
              className={`btn ${emailState === 'initial' ? 'btn-disabled' : 'wallet-button-primary'} mb-2`}
              disabled={emailState === 'initial'}
            >
              <div className={`${emailState === 'initial' ? 'btn-text-disabled' : 'btn-text'}`}>
                Login
              </div>
            </button>
            <p className="status-text">Status: {emailState}</p>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4 text-left mt-2">SMS</h2>
            <input
              className="input mb-2"
              placeholder="Enter phone number"
              onChange={(e) => setPhoneNumber(e.currentTarget.value)}
            />
            <div className="text-left mb-2">
              <button
                onClick={() => sendCodeSms({phoneNumber})}
                className="btn wallet-button-primary"
                disabled={smsState === 'sending-code'}
              >
                <div className="btn-text">Send code</div>
              </button>
            </div>
            <input
              className="input mb-2"
              placeholder="Enter OTP"
              onChange={(e) => setCodeSms(e.currentTarget.value)}
            />
            <div className="text-left mb-2">
              <button
                onClick={() => loginWithCodeSms({code: codeSms})}
                className={`btn ${smsState === 'initial' ? 'btn-disabled' : 'wallet-button-primary'}`}
                disabled={smsState === 'initial'}
              >
                <div className={`${smsState === 'initial' ? 'btn-text-disabled' : 'btn-text'}`}>
                  Login
                </div>
              </button>
            </div>
            <p className="status-text">Status: {smsState}</p>
          </div>
        </div>
        <h2 className="text-xl font-bold mb-4 text-left mt-2">OAuth</h2>
        <OAuth />
        <h2 className="text-xl font-bold mb-4 text-left mt-2">Passkey</h2>
        <Passkey />
        <h2 className="text-xl font-bold mb-4 text-left mt-2">SIWE</h2>
        <SIWE />
        <h2 className="text-xl font-bold mb-4 text-left mt-2">SIWS</h2>
        <SIWS />
        <h2 className="text-xl font-bold mb-4 text-left mt-2">Telegram</h2>
        <TelegramLogin />
      </div>
    </div>
  );
};

export default Login;
