import { createSection } from '../utils/section-builder.js';
import { showToast } from '../utils/toast.js';
import { addSessionSigners, removeSessionSigners, getUserEmbeddedEthereumWallet, getUserEmbeddedSolanaWallet } from '@privy-io/js-sdk-core';

/**
 * Session Signers Section
 */
export class SessionSigners {
  constructor(privyClient) {
    this.privy = privyClient;
    // Get signer ID from environment variable
    this.signerId = import.meta.env.VITE_SESSION_SIGNER_ID;
  }

  render(user, onUpdate) {
    const ethWallet = getUserEmbeddedEthereumWallet(user);
    const solWallet = getUserEmbeddedSolanaWallet(user);

    const actions = [
      {
        name: 'Add Session Signers (Ethereum)',
        function: async () => {
          if (!ethWallet) {
            showToast('No Ethereum wallet found. Please create one first.', 'error');
            return;
          }

          if (!this.signerId) {
            showToast('VITE_SESSION_SIGNER_ID not configured in environment variables', 'error');
            return;
          }

          try {
            // For TEE execution, pass the signer_id from environment
            const result = await addSessionSigners({
              client: this.privy,
              wallet: ethWallet,
              signers: [{
                signer_id: this.signerId,
                override_policy_ids: []
              }]
            });
            showToast('Session signers added successfully to Ethereum wallet', 'success');
            onUpdate();
          } catch (error) {
            console.error('Add session signers error:', error);
            showToast(error.message || 'Failed to add session signers', 'error');
          }
        }
      },
      {
        name: 'Add Session Signers (Solana)',
        function: async () => {
          if (!solWallet) {
            showToast('No Solana wallet found. Please create one first.', 'error');
            return;
          }

          if (!this.signerId) {
            showToast('VITE_SESSION_SIGNER_ID not configured in environment variables', 'error');
            return;
          }

          try {
            // For TEE execution, pass the signer_id from environment
            const result = await addSessionSigners({
              client: this.privy,
              wallet: solWallet,
              signers: [{
                signer_id: this.signerId,
                override_policy_ids: []
              }]
            });
            showToast('Session signers added successfully to Solana wallet', 'success');
            onUpdate();
          } catch (error) {
            console.error('Add session signers error:', error);
            showToast(error.message || 'Failed to add session signers', 'error');
          }
        }
      },
      {
        name: 'Remove Session Signers (Ethereum)',
        function: async () => {
          if (!ethWallet) {
            showToast('No Ethereum wallet found. Please create one first.', 'error');
            return;
          }

          try {
            const result = await removeSessionSigners({
              client: this.privy,
              wallet: ethWallet
            });
            showToast('Session signers removed successfully from Ethereum wallet', 'success');
            onUpdate();
          } catch (error) {
            console.error('Remove session signers error:', error);
            showToast(error.message || 'Failed to remove session signers', 'error');
          }
        }
      },
      {
        name: 'Remove Session Signers (Solana)',
        function: async () => {
          if (!solWallet) {
            showToast('No Solana wallet found. Please create one first.', 'error');
            return;
          }

          try {
            const result = await removeSessionSigners({
              client: this.privy,
              wallet: solWallet
            });
            showToast('Session signers removed successfully from Solana wallet', 'success');
            onUpdate();
          } catch (error) {
            console.error('Remove session signers error:', error);
            showToast(error.message || 'Failed to remove session signers', 'error');
          }
        }
      }
    ];

    return createSection({
      name: 'Session Signers',
      description: 'Manage session signers for embedded wallets. Session signers allow granting and revoking access to wallets for server-side operations.',
      filepath: 'src/sections/session-signers.js',
      actions
    });
  }
}

