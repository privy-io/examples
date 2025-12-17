import { createSection } from '../utils/section-builder.js';
import { showToast } from '../utils/toast.js';
import {
  getUserEmbeddedEthereumWallet,
  getUserEmbeddedSolanaWallet,
  getEntropyDetailsFromUser
} from '@privy-io/js-sdk-core';
import {
  Connection,
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';
import { base64 } from '@scure/base';

// Static state to persist across re-renders
const walletActionsState = {
  selectedWallet: null,
  lastResult: null
};

// Helper function to get MetaMask provider specifically
const getMetaMaskProvider = () => {
  if (window.ethereum) {
    // If there are multiple providers, find MetaMask
    if (window.ethereum.providers) {
      return window.ethereum.providers.find(p => p.isMetaMask);
    }
    // If only one provider and it's MetaMask
    if (window.ethereum.isMetaMask) {
      return window.ethereum;
    }
  }
  return null;
};

// Helper function to get Phantom provider
const getPhantomProvider = () => {
  if ('phantom' in window) {
    const provider = window.phantom?.solana;
    if (provider?.isPhantom) {
      return provider;
    }
  }
  if (window.solana?.isPhantom) {
    return window.solana;
  }
  return null;
};

/**
 * Wallet Actions Section
 */
export class WalletActions {
  constructor(privyClient, user) {
    this.privy = privyClient;
    this.user = user;
    this.onUpdate = null;
  }

  get selectedWallet() {
    return walletActionsState.selectedWallet;
  }

  set selectedWallet(value) {
    walletActionsState.selectedWallet = value;
  }

  get lastResult() {
    return walletActionsState.lastResult;
  }

  set lastResult(value) {
    walletActionsState.lastResult = value;
  }

  render(onUpdate) {
    this.onUpdate = onUpdate;
    
    // Get wallets and set initial selection BEFORE creating the section
    const wallets = this.getAllWallets();
    
    // Set initial selection (preserve current selection if exists)
    if (this.selectedWallet && wallets.find(w => w.address === this.selectedWallet.address)) {
      // Keep current selection
    } else if (wallets.length > 0) {
      // Set to first wallet if no selection
      this.selectedWallet = wallets[0];
    }
    
    // Now create section with actions based on selected wallet
    const section = createSection({
      name: 'Wallet actions',
      description: 'Sign messages, typed data, and transactions for both EVM and Solana wallets.',
      filepath: 'src/sections/wallet-actions.js',
      actions: this.getActions()
    });

    // Add wallet selector
    const selectorDiv = document.createElement('div');
    selectorDiv.className = 'mb-4';
    selectorDiv.innerHTML = `
      <label for="wallet-select" class="block text-sm font-medium mb-2">Select wallet:</label>
      <select id="wallet-select" class="w-full">
        <option value="">Select a wallet</option>
      </select>
    `;

    const select = selectorDiv.querySelector('select');

    wallets.forEach(wallet => {
      const option = document.createElement('option');
      option.value = wallet.address;
      option.textContent = `${wallet.address} [${wallet.type.toUpperCase()}] (${wallet.label})`;
      select.appendChild(option);
    });

    // Set the select element to show the selected wallet
    if (this.selectedWallet) {
      select.value = this.selectedWallet.address;
    }

    select.addEventListener('change', (e) => {
      this.selectedWallet = wallets.find(w => w.address === e.target.value) || null;
      // Re-render to update button states
      const parent = section.parentElement;
      if (parent) {
        const newSection = this.render(onUpdate);
        parent.replaceChild(newSection, section);
      }
    });

    // Create result display area
    const resultDiv = document.createElement('div');
    resultDiv.className = 'mt-4';
    resultDiv.id = 'wallet-result';
    
    if (this.lastResult) {
      resultDiv.innerHTML = `
        <div style="background: #f0fdf4; padding: 1rem; border-radius: 0.5rem; border: 1px solid #86efac;">
          <div style="font-family: 'Courier New', monospace; font-size: 0.875rem; word-break: break-all; color: #166534; line-height: 1.5;">
            ${this.lastResult}
          </div>
        </div>
      `;
    }

    // Insert selector and result display before actions
    const actionsContainer = section.querySelector('.section-actions');
    if (actionsContainer) {
      actionsContainer.parentElement.insertBefore(selectorDiv, actionsContainer);
      actionsContainer.parentElement.insertBefore(resultDiv, actionsContainer);
    }

    return section;
  }

  getAllWallets() {
    const wallets = [];
    
    if (this.user?.linked_accounts) {
      this.user.linked_accounts.forEach(account => {
        if (account.type === 'wallet') {
          const isEmbedded = account.wallet_client_type === 'privy';
          const walletLabel = isEmbedded ? 'Embedded' : (account.wallet_client_type || 'External');
          
          if (account.chain_type === 'ethereum') {
            wallets.push({
              address: account.address,
              type: 'ethereum',
              isEmbedded,
              walletClientType: account.wallet_client_type,
              label: walletLabel,
              account
            });
          } else if (account.chain_type === 'solana') {
            wallets.push({
              address: account.address,
              type: 'solana',
              isEmbedded,
              walletClientType: account.wallet_client_type,
              label: walletLabel,
              account
            });
          }
        }
      });
    }

    return wallets;
  }

  getActions() {
    const isEthereum = this.selectedWallet?.type === 'ethereum';
    const isSolana = this.selectedWallet?.type === 'solana';
    const isEmbedded = this.selectedWallet?.isEmbedded;

    return [
      {
        name: 'Sign message (EVM)',
        disabled: !isEthereum,
        function: () => this.signMessageEvm()
      },
      {
        name: 'Sign message (Solana)',
        disabled: !isSolana,
        function: () => this.signMessageSolana()
      },
      {
        name: 'Sign typed data (EVM)',
        disabled: !isEthereum,
        function: () => this.signTypedData()
      },
      {
        name: 'Sign transaction (EVM)',
        disabled: !isEthereum || !isEmbedded,  // Only works with embedded wallets
        function: () => this.signTransactionEvm()
      },
      {
        name: 'Sign transaction (Solana)',
        disabled: !isSolana,
        function: () => this.signTransactionSolana()
      },
      {
        name: 'Send transaction (EVM)',
        disabled: !isEthereum,
        function: () => this.sendTransactionEvm()
      },
      {
        name: 'Send transaction (Solana)',
        disabled: !isSolana,
        function: () => this.sendTransactionSolana()
      }
    ];
  }

  async signMessageEvm() {
    if (!this.selectedWallet) return;

    try {
      const message = 'Hello, world!';
      let signature;

      if (this.selectedWallet.isEmbedded) {
        // Use embedded wallet
        const wallet = getUserEmbeddedEthereumWallet(this.user);
        const { entropyId, entropyIdVerifier } = getEntropyDetailsFromUser(this.user);

        const provider = await this.privy.embeddedWallet.getEthereumProvider({
          wallet,
          entropyId,
          entropyIdVerifier
        });

        signature = await provider.request({
          method: 'personal_sign',
          params: [message, wallet.address]
        });
      } else {
        // Use external wallet (MetaMask)
        const provider = getMetaMaskProvider();
        if (!provider) {
          throw new Error('MetaMask is not installed or not accessible.');
        }

        // Request accounts to ensure wallet is connected and get current account
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found. Please connect your wallet.');
        }

        // Use the first connected account (current active account in MetaMask)
        const currentAccount = accounts[0];
        console.log('Using MetaMask account:', currentAccount);

        const client = createWalletClient({
          chain: mainnet,
          transport: custom(provider)
        });

        signature = await client.signMessage({
          account: currentAccount,
          message: message,
        });
      }

      this.lastResult = signature;
      showToast('Message signed successfully!', 'success');
      console.log('Signature:', signature);
      
      // Trigger update to re-render sections
      if (this.onUpdate) this.onUpdate();
    } catch (error) {
      console.error('Sign message error:', error);
      showToast(error.message || 'Failed to sign message', 'error');
    }
  }

  async signMessageSolana() {
    if (!this.selectedWallet) return;

    try {
      const message = 'Hello, world!';
      let signature;

      if (this.selectedWallet.isEmbedded) {
        // Use embedded wallet
        const account = getUserEmbeddedSolanaWallet(this.user);
        const { entropyId, entropyIdVerifier } = getEntropyDetailsFromUser(this.user);

        const provider = await this.privy.embeddedWallet.getSolanaProvider(
          account,
          entropyId,
          entropyIdVerifier
        );

        // Convert message to base64
        const messageBase64 = btoa(message);
        
        const result = await provider.request({
          method: 'signMessage',
          params: { message: messageBase64 }
        });

        signature = result.signature || JSON.stringify(result);
      } else {
        // Use external wallet (Phantom, etc.)
        const phantom = getPhantomProvider();
        if (!phantom) {
          throw new Error('Solana wallet not found');
        }

        const encodedMessage = new TextEncoder().encode(message);
        const response = await phantom.signMessage(encodedMessage, 'utf8');
        signature = base64.encode(response.signature);
      }

      this.lastResult = signature;
      showToast('Message signed successfully!', 'success');
      console.log('Signature:', signature);
      
      // Trigger update to re-render sections
      if (this.onUpdate) this.onUpdate();
    } catch (error) {
      console.error('Sign message error:', error);
      showToast(error.message || 'Failed to sign message', 'error');
    }
  }

  async signTypedData() {
    if (!this.selectedWallet) return;

    try {
      const typedData = {
        domain: {
          name: 'Example App',
          version: '1',
          chainId: 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
        },
        types: {
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' }
          ],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
            { name: 'contents', type: 'string' }
          ]
        },
        primaryType: 'Mail',
        message: {
          from: {
            name: 'Alice',
            wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
          },
          to: {
            name: 'Bob',
            wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
          },
          contents: 'Hello, Bob!'
        }
      };

      let signature;

      if (this.selectedWallet.isEmbedded) {
        // Use embedded wallet
        const wallet = getUserEmbeddedEthereumWallet(this.user);
        const { entropyId, entropyIdVerifier } = getEntropyDetailsFromUser(this.user);

        const provider = await this.privy.embeddedWallet.getEthereumProvider({
          wallet,
          entropyId,
          entropyIdVerifier
        });

        signature = await provider.request({
          method: 'eth_signTypedData_v4',
          params: [wallet.address, JSON.stringify(typedData)]
        });
      } else {
        // Use external wallet (MetaMask)
        const provider = getMetaMaskProvider();
        if (!provider) {
          throw new Error('MetaMask is not installed or not accessible.');
        }

        // Request accounts to ensure wallet is connected and get current account
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found. Please connect your wallet.');
        }

        // Use the first connected account (current active account in MetaMask)
        const currentAccount = accounts[0];
        console.log('Using MetaMask account:', currentAccount);

        const client = createWalletClient({
          chain: mainnet,
          transport: custom(provider)
        });

        signature = await client.signTypedData({
          account: currentAccount,
          domain: typedData.domain,
          types: typedData.types,
          primaryType: typedData.primaryType,
          message: typedData.message,
        });
      }

      this.lastResult = signature;
      showToast('Typed data signed successfully!', 'success');
      console.log('Signature:', signature);
      
      // Trigger update to re-render sections
      if (this.onUpdate) this.onUpdate();
    } catch (error) {
      console.error('Sign typed data error:', error);
      showToast(error.message || 'Failed to sign typed data', 'error');
    }
  }

  async signTransactionEvm() {
    if (!this.selectedWallet) return;

    try {
      let signedTx;

      if (this.selectedWallet.isEmbedded) {
        // Use embedded wallet
        const wallet = getUserEmbeddedEthereumWallet(this.user);
        const { entropyId, entropyIdVerifier } = getEntropyDetailsFromUser(this.user);

        const provider = await this.privy.embeddedWallet.getEthereumProvider({
          wallet,
          entropyId,
          entropyIdVerifier
        });

        // Get current chainId from provider
        const chainId = await provider.request({ method: 'eth_chainId' });

        // Zero-value transaction
        const tx = {
          from: wallet.address,
          to: wallet.address,
          value: '0x0',
          data: '0x',
          chainId: chainId
        };

        signedTx = await provider.request({
          method: 'eth_signTransaction',
          params: [tx]
        });
      } else {
        // Use external wallet (MetaMask, etc.)
        if (!window.ethereum) {
          throw new Error('External wallet not found');
        }

        // Zero-value transaction
        const tx = {
          from: this.selectedWallet.address,
          to: this.selectedWallet.address,
          value: '0x0',
          data: '0x',
        };

        signedTx = await window.ethereum.request({
          method: 'eth_signTransaction',
          params: [tx]
        });
      }

      this.lastResult = signedTx;
      showToast('Transaction signed successfully!', 'success');
      console.log('Signed transaction:', signedTx);
      
      // Trigger update to re-render sections
      if (this.onUpdate) this.onUpdate();
    } catch (error) {
      console.error('Sign transaction error:', error);
      showToast(error.message || 'Failed to sign transaction', 'error');
    }
  }

  async sendTransactionEvm() {
    if (!this.selectedWallet) return;

    try {
      let txHash;

      if (this.selectedWallet.isEmbedded) {
        // Use embedded wallet
        const wallet = getUserEmbeddedEthereumWallet(this.user);
        const { entropyId, entropyIdVerifier } = getEntropyDetailsFromUser(this.user);

        const provider = await this.privy.embeddedWallet.getEthereumProvider({
          wallet,
          entropyId,
          entropyIdVerifier
        });

        // Get current chainId from provider
        const chainId = await provider.request({ method: 'eth_chainId' });

        // Zero-value transaction to self
        txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: wallet.address,
            to: wallet.address,
            value: '0x0',
            data: '0x',
            chainId: chainId
          }]
        });
      } else {
        // Use external wallet (MetaMask)
        const provider = getMetaMaskProvider();
        if (!provider) {
          throw new Error('MetaMask is not installed or not accessible.');
        }

        // Request accounts to ensure wallet is connected and get current account
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found. Please connect your wallet.');
        }

        // Use the first connected account (current active account in MetaMask)
        const currentAccount = accounts[0];
        console.log('Using MetaMask account:', currentAccount);

        const client = createWalletClient({
          chain: mainnet,
          transport: custom(provider)
        });

        // Zero-value transaction to self
        txHash = await client.sendTransaction({
          account: currentAccount,
          to: currentAccount,
          value: 0n,
        });
      }

      this.lastResult = txHash;
      showToast('Transaction sent successfully!', 'success');
      console.log('Transaction hash:', txHash);
      
      // Trigger update to re-render sections
      if (this.onUpdate) this.onUpdate();
    } catch (error) {
      console.error('Send transaction error:', error);
      showToast(error.message || 'Failed to send transaction', 'error');
    }
  }

  async signTransactionSolana() {
    if (!this.selectedWallet) return;

    try {
      // Create connection to Solana devnet
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();

      // Create a zero-value transfer transaction to self
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(this.selectedWallet.address),
          toPubkey: new PublicKey(this.selectedWallet.address),
          lamports: 0, // Zero value transfer
        })
      );

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(this.selectedWallet.address);

      let signedTx;

      if (this.selectedWallet.isEmbedded) {
        // Use embedded wallet
        const account = getUserEmbeddedSolanaWallet(this.user);
        const { entropyId, entropyIdVerifier } = getEntropyDetailsFromUser(this.user);

        const provider = await this.privy.embeddedWallet.getSolanaProvider(
          account,
          entropyId,
          entropyIdVerifier
        );

        // Sign the transaction
        signedTx = await provider.request({
          method: 'signTransaction',
          params: { transaction }
        });
      } else {
        // Use external wallet (Phantom, etc.)
        const phantom = getPhantomProvider();
        if (!phantom) {
          throw new Error('Solana wallet not found');
        }

        // Sign transaction with Phantom
        signedTx = await phantom.signTransaction(transaction);
      }

      // Extract signature from the signed transaction
      const txSignature = signedTx.signature || signedTx.signatures?.[0] || JSON.stringify(signedTx);
      this.lastResult = typeof txSignature === 'object' ? JSON.stringify(txSignature) : txSignature;
      showToast('Solana transaction signed successfully!', 'success');
      console.log('Signed transaction:', signedTx);
      
      // Trigger update to re-render sections
      if (this.onUpdate) this.onUpdate();
    } catch (error) {
      console.error('Sign Solana transaction error:', error);
      showToast(error.message || 'Failed to sign Solana transaction', 'error');
    }
  }

  async sendTransactionSolana() {
    if (!this.selectedWallet) return;

    try {
      // Create connection to Solana devnet
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();

      // Create a zero-value transfer transaction to self
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(this.selectedWallet.address),
          toPubkey: new PublicKey(this.selectedWallet.address),
          lamports: 0, // Zero value transfer
        })
      );

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(this.selectedWallet.address);

      let signature;

      if (this.selectedWallet.isEmbedded) {
        // Use embedded wallet
        const account = getUserEmbeddedSolanaWallet(this.user);
        const { entropyId, entropyIdVerifier } = getEntropyDetailsFromUser(this.user);

        const provider = await this.privy.embeddedWallet.getSolanaProvider(
          account,
          entropyId,
          entropyIdVerifier
        );

        // Sign and send the transaction
        signature = await provider.request({
          method: 'signAndSendTransaction',
          params: { 
            transaction,
            connection,
            options: { skipPreflight: false }
          }
        });
      } else {
        // Use external wallet (Phantom, etc.)
        const phantom = getPhantomProvider();
        if (!phantom) {
          throw new Error('Solana wallet not found');
        }

        // Sign and send transaction with Phantom
        const { signature: sig } = await phantom.signAndSendTransaction(transaction);
        signature = sig;
      }

      this.lastResult = signature;
      showToast('Transaction sent successfully!', 'success');
      console.log('Transaction signature:', signature);
      
      // Trigger update to re-render sections
      if (this.onUpdate) this.onUpdate();
    } catch (error) {
      console.error('Send Solana transaction error:', error);
      showToast(error.message || 'Failed to send Solana transaction', 'error');
    }
  }
}


