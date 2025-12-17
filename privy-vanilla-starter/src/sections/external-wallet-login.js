import { createWalletClient, custom, getAddress } from 'viem';
import { mainnet } from 'viem/chains';
import { base64 } from '@scure/base';
import { showToast } from '../utils/toast.js';

export class ExternalWalletLogin {
  constructor(privy, onLoginSuccess) {
    this.privy = privy;
    this.onLoginSuccess = onLoginSuccess;
  }

  async loginWithMetaMask() {
    try {
      if (!window.ethereum) {
        showToast('MetaMask is not installed. Please install MetaMask to continue.', 'error');
        return;
      }

      // Create wallet client with viem
      const client = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum)
      });

      // Request account access
      const [address] = await client.requestAddresses();
      
      // Get checksummed address
      const checksummedAddress = getAddress(address);
      
      // Get chain ID
      const chainId = await client.getChainId();
      const formattedChainId = `eip155:${chainId}`;

      console.log('SIWE Login - Checksummed Address:', checksummedAddress);
      console.log('SIWE Login - Chain ID:', formattedChainId);

      // Initialize SIWE flow
      const { message } = await this.privy.auth.siwe.init(
        {
          address: checksummedAddress,
          chainId: formattedChainId,
          walletClientType: 'metamask',
          connectorType: 'injected',
        },
        window.location.host,
        window.location.origin
      );

      console.log('SIWE Message to sign:', message);

      // Sign message with wallet client
      const signature = await client.signMessage({
        account: checksummedAddress,
        message: message,
      });

      console.log('SIWE Signature:', signature);

      // Complete login
      const session = await this.privy.auth.siwe.loginWithSiwe(
        signature,
        undefined,
        undefined,
        'login-or-sign-up',
        {
          ethereum: { createOnLogin: 'user-without-wallets' },
          solana: { createOnLogin: 'user-without-wallets' }
        }
      );

      this.onLoginSuccess(session);
    } catch (error) {
      console.error('MetaMask login error:', error);
      if (error.code === 4001) {
        showToast('MetaMask: User rejected the request', 'error');
      } else if (error.code === -32002) {
        showToast('MetaMask: Request already pending. Please check MetaMask.', 'error');
      } else {
        showToast(`Login failed: ${error.message}`, 'error');
      }
    }
  }

  async loginWithPhantom() {
    try {
      if (!window.solana || !window.solana.isPhantom) {
        showToast('Phantom wallet is not installed. Please install Phantom to continue.', 'error');
        return;
      }

      // Connect to Phantom
      const resp = await window.solana.connect();
      const address = resp.publicKey.toString();

      console.log('SIWS Login - Address:', address);

      // Fetch nonce for SIWS
      const { nonce } = await this.privy.auth.siws.fetchNonce({ address });

      // Create SIWS message (must match Privy's exact format)
      const domain = window.location.host;
      const uri = window.location.origin;
      const statement = `You are proving you own ${address}.`;
      const issuedAt = new Date().toISOString();
      
      const message = `${domain} wants you to sign in with your Solana account:
${address}

${statement}

URI: ${uri}
Version: 1
Chain ID: mainnet
Nonce: ${nonce}
Issued At: ${issuedAt}
Resources:
- https://privy.io`;

      console.log('SIWS Message to sign:', message);

      // Sign message with Phantom
      const encodedMessage = new TextEncoder().encode(message);
      const response = await window.solana.signMessage(encodedMessage, 'utf8');
      
      // Convert Uint8Array signature to base64 using @scure/base
      const signature = base64.encode(response.signature);

      console.log('SIWS Signature:', signature);
      console.log('SIWS Address from response:', response.publicKey.toString());

      // Complete login
      const session = await this.privy.auth.siws.login({
        message,
        signature,
        walletClientType: 'phantom',
        connectorType: 'injected',
        mode: 'login-or-sign-up',
        opts: {
          ethereum: { createOnLogin: 'user-without-wallets' },
          solana: { createOnLogin: 'user-without-wallets' }
        }
      });

      this.onLoginSuccess(session);
    } catch (error) {
      console.error('Phantom login error:', error);
      if (error.code === 4001) {
        showToast('Phantom: User rejected the request', 'error');
      } else {
        showToast(`Login failed: ${error.message}`, 'error');
      }
    }
  }
}
