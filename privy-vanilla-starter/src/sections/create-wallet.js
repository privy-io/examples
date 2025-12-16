import { createSection } from '../utils/section-builder.js';
import { showToast } from '../utils/toast.js';

/**
 * Create Wallet Section
 */
export class CreateWallet {
  constructor(privyClient) {
    this.privy = privyClient;
  }

  render(onUpdate) {
    const actions = [
      {
        name: 'Create Ethereum wallet',
        function: async () => {
          try {
            await this.privy.embeddedWallet.create({});
            showToast('Ethereum wallet created successfully', 'success');
            onUpdate();
          } catch (error) {
            console.error('Create Ethereum wallet error:', error);
            showToast(error.message || 'Failed to create Ethereum wallet', 'error');
          }
        }
      },
      {
        name: 'Create Solana wallet',
        function: async () => {
          try {
            await this.privy.embeddedWallet.createSolana();
            showToast('Solana wallet created successfully', 'success');
            onUpdate();
          } catch (error) {
            console.error('Create Solana wallet error:', error);
            showToast(error.message || 'Failed to create Solana wallet', 'error');
          }
        }
      }
    ];

    return createSection({
      name: 'Create a wallet',
      description: 'Creates a new embedded wallet for the user. Each user can have multiple wallets.',
      filepath: 'src/sections/create-wallet.js',
      actions
    });
  }
}

