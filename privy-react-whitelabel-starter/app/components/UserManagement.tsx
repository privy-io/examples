'use client';
import {useState} from 'react';
import {useMfaEnrollment, usePrivy} from '@privy-io/react-auth';

const UserManagement = () => {
  const {user, authenticated} = usePrivy();
  const {
    initEnrollmentWithSms,
    submitEnrollmentWithSms,
    initEnrollmentWithTotp,
    submitEnrollmentWithTotp,
    initEnrollmentWithPasskey,
    submitEnrollmentWithPasskey,
  } = useMfaEnrollment();

  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  const [totpAuthUrl, setTotpAuthUrl] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [passkeyMsg, setPasskeyMsg] = useState('');
  const [message, setMessage] = useState('');

  const enrollSms = async () => {
    await initEnrollmentWithSms({phoneNumber: phone});
    setSmsSent(true);
    setMessage('SMS sent');
  };

  const verifySms = async () => {
    await submitEnrollmentWithSms({phoneNumber: phone, mfaCode: smsCode});
    setSmsSent(false);
    setPhone('');
    setSmsCode('');
    setMessage('SMS verified');
  };

  const startTotp = async () => {
    const {authUrl, secret} = await initEnrollmentWithTotp();
    setTotpAuthUrl(authUrl);
    setTotpSecret(secret);
    setMessage('TOTP initialized');
  };

  const verifyTotp = async () => {
    await submitEnrollmentWithTotp({mfaCode: totpCode});
    setTotpCode('');
    setMessage('TOTP verified');
  };

  const enrollPasskey = async () => {
    setPasskeyMsg('');
    const passkeys = (user?.linkedAccounts || []).filter((a: any) => a.type === 'passkey');
    if (!passkeys.length) {
      setPasskeyMsg('No passkeys linked. Add a passkey first (see Passkey section).');
      return;
    }
    try {
      await initEnrollmentWithPasskey();
      const credentialIds = passkeys.map((x: any) => x.credentialId);
      await submitEnrollmentWithPasskey({credentialIds});
      setPasskeyMsg('Passkey enrolled for MFA.');
    } catch (e: any) {
      setPasskeyMsg(e?.message || 'Failed to enroll passkey for MFA.');
    }
  };

  return (
    <div className="mx-4 px-4">
      <h2 className="text-xl font-bold mb-2">MFA Enrollment</h2>
      {message && <div className="text-xs mt-2">{message}</div>}

      <div className="mb-4">
        <h3 className="font-semibold mb-2">SMS</h3>
        {!smsSent ? (
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="(555) 555 5555"
              onChange={(e) => setPhone(e.currentTarget.value)}
            />
            <button className="btn wallet-button-primary" onClick={enrollSms}>
              <div className="btn-text">Send code</div>
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="123456"
              onChange={(e) => setSmsCode(e.currentTarget.value)}
            />
            <button className="btn wallet-button-primary" onClick={verifySms}>
              <div className="btn-text">Verify</div>
            </button>
          </div>
        )}
      </div>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">TOTP</h3>
        {!totpAuthUrl ? (
          <button className="btn wallet-button-primary" onClick={startTotp}>
            <div className="btn-text">Generate QR / Secret</div>
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col items-start gap-2">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(totpAuthUrl || '')}`}
                alt="TOTP QR"
                width={180}
                height={180}
              />
              <a href={totpAuthUrl || undefined} className="link break-all">
                Open in authenticator app
              </a>
            </div>
            {totpSecret && <div className="text-xs break-all">Secret: {totpSecret}</div>}
            <div className="flex gap-2">
              <input
                className="input"
                placeholder="123456"
                onChange={(e) => setTotpCode(e.currentTarget.value)}
              />
              <button className="btn wallet-button-primary" onClick={verifyTotp}>
                <div className="btn-text">Verify</div>
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mb-2">
        <h3 className="font-semibold mb-2">Passkey</h3>
        <button className="btn wallet-button-primary" onClick={enrollPasskey}>
          <div className="btn-text">Enroll Passkey</div>
        </button>
        {!!passkeyMsg && <div className="text-xs mt-2">{passkeyMsg}</div>}
        {!!(user?.linkedAccounts || []).filter((a: any) => a.type === 'passkey').length && (
          <div className="text-xs mt-1">
            Linked passkeys:{' '}
            {(user?.linkedAccounts || [])
              .filter((a: any) => a.type === 'passkey')
              .map((x: any) => x.credentialId)
              .join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
