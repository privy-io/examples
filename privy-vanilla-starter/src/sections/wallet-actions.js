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

// Static state to persist across re-renders
const walletActionsState = {
  selectedWallet: null,
  lastResult: null
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
    const wallets = this.getAllWallets();

    wallets.forEach(wallet => {
      const option = document.createElement('option');
      option.value = wallet.address;
      option.textContent = `${wallet.address} [${wallet.type}]`;
      select.appendChild(option);
    });

    // Set initial selection (preserve current selection if exists)
    if (this.selectedWallet && wallets.find(w => w.address === this.selectedWallet.address)) {
      // Keep current selection
      select.value = this.selectedWallet.address;
    } else if (wallets.length > 0) {
      // Set to first wallet if no selection
      this.selectedWallet = wallets[0];
      select.value = wallets[0].address;
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
        if (account.type === 'wallet' && account.wallet_client_type === 'privy') {
          if (account.chain_type === 'ethereum') {
            wallets.push({
              address: account.address,
              type: 'ethereum',
              account
            });
          } else if (account.chain_type === 'solana') {
            wallets.push({
              address: account.address,
              type: 'solana',
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
        disabled: !isEthereum,
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
      const wallet = getUserEmbeddedEthereumWallet(this.user);
      const { entropyId, entropyIdVerifier } = getEntropyDetailsFromUser(this.user);

      const provider = await this.privy.embeddedWallet.getEthereumProvider({
        wallet,
        entropyId,
        entropyIdVerifier
      });

      const message = 'Hello, world!';
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, wallet.address]
      });

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
      const account = getUserEmbeddedSolanaWallet(this.user);
      const { entropyId, entropyIdVerifier } = getEntropyDetailsFromUser(this.user);

      const provider = await this.privy.embeddedWallet.getSolanaProvider(
        account,
        entropyId,
        entropyIdVerifier
      );

      const message = 'Hello, world!';
      // Convert message to base64
      const messageBase64 = btoa(message);
      
      const result = await provider.request({
        method: 'signMessage',
        params: { message: messageBase64 }
      });

      this.lastResult = result.signature || JSON.stringify(result);
      showToast('Message signed successfully!', 'success');
      console.log('Signature:', result);
      
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
      const wallet = getUserEmbeddedEthereumWallet(this.user);
      const { entropyId, entropyIdVerifier } = getEntropyDetailsFromUser(this.user);

      const provider = await this.privy.embeddedWallet.getEthereumProvider({
        wallet,
        entropyId,
        entropyIdVerifier
      });

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

      const signature = await provider.request({
        method: 'eth_signTypedData_v4',
        params: [wallet.address, JSON.stringify(typedData)]
      });

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

      const signedTx = await provider.request({
        method: 'eth_signTransaction',
        params: [tx]
      });

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
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: wallet.address,
          to: wallet.address,
          value: '0x0',
          data: '0x',
          chainId: chainId
        }]
      });

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
      const account = getUserEmbeddedSolanaWallet(this.user);
      const { entropyId, entropyIdVerifier } = getEntropyDetailsFromUser(this.user);

      const provider = await this.privy.embeddedWallet.getSolanaProvider(
        account,
        entropyId,
        entropyIdVerifier
      );

      // Create connection to Solana devnet
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();

      // Create a zero-value transfer transaction to self
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(account.address),
          toPubkey: new PublicKey(account.address),
          lamports: 0, // Zero value transfer
        })
      );

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(account.address);

      // Sign the transaction
      const signedTx = await provider.request({
        method: 'signTransaction',
        params: { transaction }
      });

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
      const account = getUserEmbeddedSolanaWallet(this.user);
      const { entropyId, entropyIdVerifier } = getEntropyDetailsFromUser(this.user);

      const provider = await this.privy.embeddedWallet.getSolanaProvider(
        account,
        entropyId,
        entropyIdVerifier
      );

      // Create connection to Solana devnet
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();

      // Create a zero-value transfer transaction to self
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(account.address),
          toPubkey: new PublicKey(account.address),
          lamports: 0, // Zero value transfer
        })
      );

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(account.address);

      // Sign and send the transaction
      const signature = await provider.request({
        method: 'signAndSendTransaction',
        params: { 
          transaction,
          connection,
          options: { skipPreflight: false }
        }
      });

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


