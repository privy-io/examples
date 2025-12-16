import { createSection } from '../utils/section-builder.js';
import { WalletActions } from '../sections/wallet-actions.js';
import { CreateWallet } from '../sections/create-wallet.js';
import { showToast } from '../utils/toast.js';
import {
  getUserEmbeddedEthereumWallet,
  getUserEmbeddedSolanaWallet,
  getEntropyDetailsFromUser
} from '@privy-io/js-sdk-core';

/**
 * Manages all feature sections
 */
export class SectionsManager {
  constructor(privyClient) {
    this.privy = privyClient;
    this.container = document.getElementById('sections-container');
    this.currentUser = null;
  }

  /**
   * Render all sections
   */
  renderSections(user) {
    this.currentUser = user;
    this.container.innerHTML = '';

    // Create wallet section
    const createWalletSection = new CreateWallet(this.privy);
    this.container.appendChild(createWalletSection.render(() => this.refreshUser()));

    // Wallet actions section
    const walletActionsSection = new WalletActions(this.privy, user);
    this.container.appendChild(walletActionsSection.render(() => this.refreshUser()));
  }

  /**
   * Refresh user data
   */
  async refreshUser() {
    try {
      const result = await this.privy.user.get();
      if (result?.user) {
        this.renderSections(result.user);
        document.getElementById('user-object').textContent = JSON.stringify(result.user, null, 2);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }


}

