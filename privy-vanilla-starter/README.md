# Privy + Vanilla JS Starter

This example showcases how to get started using Privy's Core JS SDK inside a pure vanilla JavaScript application without any frontend framework.


## Getting Started

### 1. Clone the Project

```bash
mkdir -p privy-vanilla-starter && curl -L https://github.com/privy-io/privy-examples/archive/main.tar.gz | tar -xz --strip=2 -C privy-vanilla-starter examples-main/privy-vanilla-starter && cd privy-vanilla-starter
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file and configure your Privy app credentials:

```bash
cp env.sample .env
```

Update `.env` with your Privy app credentials:

```env
# Public - Safe to expose in the browser
VITE_PRIVY_APP_ID=your_app_id_here
VITE_PRIVY_APP_CLIENT_ID=your_client_id_here  # Optional

# Additional Signer ID for delegation (optional)
VITE_SESSION_SIGNER_ID=your_signer_id_here
```

**Important:** Variables prefixed with `VITE_` are exposed to the browser. Get your credentials from the [Privy Dashboard](https://dashboard.privy.io).

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to see the application.

## Core Functionality

### 1. Initialize Privy Client

Initialize the Core JS SDK with your app credentials and set up the embedded wallet iframe.

[`src/lib/privy-client.js`](./src/lib/privy-client.js)

```javascript
import Privy, { LocalStorage } from '@privy-io/js-sdk-core';

const privy = new Privy({
  appId: import.meta.env.VITE_PRIVY_APP_ID,
  clientId: import.meta.env.VITE_PRIVY_APP_CLIENT_ID,
  storage: new LocalStorage()
});

// Setup iframe for embedded wallet
const iframe = document.getElementById('privy-iframe');
iframe.src = privy.embeddedWallet.getURL();

privy.setMessagePoster(iframe.contentWindow);
window.addEventListener('message', (e) => {
  privy.embeddedWallet.onMessage(e.data);
});
```

### 2. Login with External Wallets

Support login with external wallets like MetaMask (Ethereum) and Phantom (Solana) using SIWE and SIWS.

[`src/sections/external-wallet-login.js`](./src/sections/external-wallet-login.js)

```javascript
// MetaMask login with SIWE (using viem)
import { createWalletClient, custom, getAddress } from 'viem';

const client = createWalletClient({
  transport: custom(window.ethereum)
});

const [address] = await client.requestAddresses();
const chainId = await client.getChainId();

const { message } = await privy.auth.siwe.init(
  { address: getAddress(address), chainId: `eip155:${chainId}` },
  window.location.host,
  window.location.origin
);

const signature = await client.signMessage({
  account: address,
  message: message,
});

const session = await privy.auth.siwe.loginWithSiwe(signature);

// Phantom login with SIWS
const resp = await window.solana.connect();
const { nonce } = await privy.auth.siws.fetchNonce({ 
  address: resp.publicKey.toString() 
});

const message = createSiwsMessage(/* ... */);
const signedMessage = await window.solana.signMessage(encodedMessage);
const signature = btoa(String.fromCharCode(...signedMessage.signature));

const session = await privy.auth.siws.login({ message, signature });
```

### 3. Authenticate with Email

Login or sign up using passwordless email authentication with OTP codes.

[`src/ui/auth-manager.js`](./src/ui/auth-manager.js)

```javascript
// Send OTP code
await privy.auth.email.sendCode(email);

// Verify code and login
const session = await privy.auth.email.loginWithCode(
  email,
  code,
  undefined,
  {
    ethereum: { createOnLogin: 'user-without-wallets' },
    solana: { createOnLogin: 'user-without-wallets' }
  }
);
```

### 3a. Authenticate with SMS

Login or sign up using SMS authentication with OTP codes.

[`src/sections/sms-login.js`](./src/sections/sms-login.js)

```javascript
// Send SMS OTP code
await privy.auth.sms.sendCode(phoneNumber);

// Verify code and login
const session = await privy.auth.sms.loginWithCode(
  phoneNumber,
  code,
  undefined,
  {
    ethereum: { createOnLogin: 'user-without-wallets' },
    solana: { createOnLogin: 'user-without-wallets' }
  }
);
```

### 3b. Authenticate with OAuth (Google, Twitter, Discord, GitHub, etc.)

Login or sign up using OAuth providers with full-page redirect flow.

[`src/sections/oauth-login.js`](./src/sections/oauth-login.js)

```javascript
// Step 1: Generate OAuth URL and redirect to provider
const redirectURI = window.location.href.split('?')[0];
const { url } = await privy.auth.oauth.generateURL('google', redirectURI);

// Redirect user to OAuth provider
window.location.href = url;

// Step 2: After OAuth provider redirects back, complete login
// The URL will contain 'code' and 'state' query parameters
const urlParams = new URLSearchParams(window.location.search);
const authorizationCode = urlParams.get('code');
const stateCode = urlParams.get('state');

if (authorizationCode && stateCode) {
  const session = await privy.auth.oauth.loginWithCode(
    authorizationCode,
    stateCode,
    undefined, // provider (optional)
    undefined, // codeType
    'login-or-sign-up',
    {
      embedded: {
        ethereum: { createOnLogin: 'user-without-wallets' },
        solana: { createOnLogin: 'user-without-wallets' }
      }
    }
  );
}
```

**Supported OAuth Providers:**
- Google
- Twitter (X)
- Discord
- GitHub
- Apple
- LinkedIn
- Spotify
- TikTok
- Instagram
- Line

**Note:** The OAuth flow uses full-page redirects. The user will be redirected to the OAuth provider, then back to your app after authentication.

### 4. Link Accounts

Allow users to link multiple authentication methods to their account.

[`src/sections/link-accounts.js`](./src/sections/link-accounts.js)

#### Link Email
```javascript
// Send code to email
await privy.auth.email.sendCode(email);

// Link email with code
await privy.auth.email.linkWithCode(email, code);
```

#### Link Phone
```javascript
// Send SMS code
await privy.auth.phone.sendCode(phoneNumber);

// Link phone with code
await privy.auth.phone.linkWithCode(phoneNumber, code);
```

#### Link OAuth Accounts
```javascript
// Generate OAuth URL for linking
const redirectURI = window.location.href;
const { url } = await privy.auth.oauth.generateURL('google', redirectURI);

// Redirect to OAuth provider
window.location.href = url;

// After redirect, complete the link
await privy.auth.oauth.linkWithCode(
  authorizationCode,
  stateCode,
  'google'
);
```

**Supported Link Methods:**
- Email (with OTP verification)
- Phone/SMS (with OTP verification)
- OAuth providers (Google, Twitter, Discord, GitHub, Apple, LinkedIn, Spotify, TikTok)
- Wallets (via SIWE/SIWS)
- Passkeys (WebAuthn)

#### Link Passkey

Link a passkey to your account for passwordless authentication using biometrics or device PIN.

```javascript
import { startRegistration } from '@simplewebauthn/browser';

// Step 1: Get registration options from Privy
const response = await privy.auth.passkey.generateRegistrationOptions();

// Convert snake_case to camelCase for WebAuthn API
const options = toCamelCase(response.options);

// Step 2: Prompt user to create passkey using browser WebAuthn API
const registrationResponse = await startRegistration(options);

// Step 3: Link the passkey to user's account
await privy.auth.passkey.linkWithPasskey(registrationResponse);
```


### 5. Unlink Accounts

Remove linked authentication methods from a user's account.

[`src/sections/unlink-accounts.js`](./src/sections/unlink-accounts.js)

```javascript
// Unlink email
await privy.auth.email.unlink(emailAddress);

// Unlink phone
await privy.auth.phone.unlink(phoneNumber);

// Unlink OAuth account
await privy.auth.oauth.unlink(provider, subject);
```

**Supported Unlink Methods:**
- Email
- Phone/SMS
- OAuth providers (Google, Twitter, Discord, GitHub, Apple, LinkedIn, Spotify, TikTok)
- Wallets

### 6. Multi-Factor Authentication (MFA)

Add an extra layer of security to your account by enrolling in MFA methods: SMS, TOTP (authenticator apps), and Passkey.

[`src/sections/mfa.js`](./src/sections/mfa.js)

#### Enroll SMS MFA
```javascript
// Step 1: Initialize SMS MFA enrollment
await privy.mfa.initEnrollMfa({ 
  method: 'sms', 
  phoneNumber: '+1234567890' 
});

// Step 2: Submit verification code
await privy.mfa.submitEnrollMfa({ 
  method: 'sms', 
  phoneNumber: '+1234567890',
  code: '123456'
});
```

#### Enroll TOTP MFA
```javascript
// Step 1: Initialize TOTP MFA enrollment (returns QR code)
const { authUrl, secret } = await privy.mfa.initEnrollMfa({ 
  method: 'totp' 
});
// Display authUrl as QR code for user to scan with authenticator app

// Step 2: Submit verification code from authenticator
await privy.mfa.submitEnrollMfa({ 
  method: 'totp', 
  code: '123456' 
});
```

#### Enroll Passkey MFA
```javascript
// Enroll existing passkeys for MFA
const passkeyAccounts = user.linked_accounts.filter(
  account => account.type === 'passkey'
);
const credentialIds = passkeyAccounts.map(account => account.credential_id);

await privy.mfa.submitEnrollMfa({ 
  method: 'passkey', 
  credentialIds 
});
```

#### Unenroll MFA

MFA unenrollment requires MFA verification to prevent unauthorized removal. This starter demonstrates the proper flow:

```javascript
// Set up MFA verification listener
const mfaListener = async () => {
  await handleMfaVerification(user);
};

privy.mfaPromises.on('mfaRequired', mfaListener);

try {
  // Unenroll SMS or TOTP
  await privy.mfa.unenrollMfa('sms'); // or 'totp'
  
  // For Passkey, use submitEnrollMfa with empty credentialIds
  await privy.mfa.submitEnrollMfa({ 
    method: 'passkey', 
    credentialIds: [],
    removeForLogin: false
  });
} finally {
  privy.mfaPromises.off('mfaRequired', mfaListener);
}
```

The MFA verification flow:
1. Listen for `mfaRequired` events via `privy.mfaPromises`
2. Prompt user for verification (SMS code, TOTP code, or Passkey)
3. Submit verification by resolving `privy.mfaPromises.rootPromise.current`:
   ```javascript
   privy.mfaPromises.rootPromise.current.resolve({
     mfaMethod: 'totp', // or 'sms', 'passkey'
     mfaCode: code,     // string for SMS/TOTP, or authenticatorResponse for Passkey
     relyingParty: window.location.hostname
   });
   ```
4. Complete unenrollment after successful verification

**MFA Methods:**
- **SMS**: Receive verification codes via text message
- **TOTP**: Use authenticator apps (Google Authenticator, Authy, etc.)
- **Passkey**: Use device biometrics (must link passkey first)

**MFA for Wallet Actions:**
Once MFA is enrolled, sensitive wallet operations (signing, transactions) automatically trigger MFA verification when the MFA token expires (~15 minutes by default). The same `mfaRequired` event listener pattern is used to handle verification seamlessly in the background.

### 7. Create Embedded Wallets

Programmatically create embedded wallets for Ethereum and Solana blockchains.

[`src/sections/create-wallet.js`](./src/sections/create-wallet.js)

```javascript
// Create Ethereum wallet
await privy.embeddedWallet.create({});

// Create Solana wallet
await privy.embeddedWallet.createSolana();
```

### 8. Additional Signers

Manage additional signers for embedded wallets. Additional signers allow granting and revoking server-side access to wallets.

[`src/sections/session-signers.js`](./src/sections/session-signers.js)

```javascript
import { addSessionSigners, removeSessionSigners } from '@privy-io/js-sdk-core';

// Add session signers to a wallet (TEE execution)
await addSessionSigners({
  client: privy,
  wallet: ethWallet,
  signers: [{
    signer_id: import.meta.env.VITE_SESSION_SIGNER_ID,
    override_policy_ids: []
  }]
});

// Remove session signers from a wallet
await removeSessionSigners({
  client: privy,
  wallet: ethWallet
});
```


### 9. Sign Messages and Transactions

Send transactions on both Ethereum and Solana with comprehensive wallet action support.

[`src/sections/wallet-actions.js`](./src/sections/wallet-actions.js)

```javascript
import {
  getUserEmbeddedEthereumWallet,
  getUserEmbeddedSolanaWallet,
  getEntropyDetailsFromUser
} from '@privy-io/js-sdk-core';

// Get wallet and entropy details
const wallet = getUserEmbeddedEthereumWallet(user);
const { entropyId, entropyIdVerifier } = getEntropyDetailsFromUser(user);

// Get provider
const provider = await privy.embeddedWallet.getEthereumProvider({
  wallet,
  entropyId,
  entropyIdVerifier
});

// Sign message
const signature = await provider.request({
  method: 'personal_sign',
  params: ['Hello, world!', wallet.address]
});

// Send transaction
const txHash = await provider.request({
  method: 'eth_sendTransaction',
  params: [{
    from: wallet.address,
    to: wallet.address,
    value: '0x0',
    chainId: chainId
  }]
});
```

## Relevant Links

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [Core JS SDK Recipe](https://docs.privy.io/recipes/core-js)

