import { showToast } from '../utils/toast.js';

/**
 * SMS Login Handler
 */
export class SmsLogin {
  constructor(privy, onLoginSuccess) {
    this.privy = privy;
    this.onLoginSuccess = onLoginSuccess;
    this.currentPhone = null;
  }

  /**
   * Send SMS code to phone number
   */
  async sendCode(phoneNumber) {
    try {
      await this.privy.auth.phone.sendCode(phoneNumber);
      this.currentPhone = phoneNumber;
      showToast('SMS code sent! Check your phone', 'success');
      return true;
    } catch (error) {
      console.error('Send SMS code error:', error);
      throw error;
    }
  }

  /**
   * Verify SMS code and complete login
   */
  async verifyCode(code) {
    if (!this.currentPhone) {
      throw new Error('No phone number set. Please send a code first.');
    }

    try {
      const session = await this.privy.auth.phone.loginWithCode(
        this.currentPhone,
        code,
        'login-or-sign-up',
        {
          embedded: {
            ethereum: { createOnLogin: 'user-without-wallets' },
            solana: { createOnLogin: 'user-without-wallets' }
          }
        }
      );

      showToast('SMS login successful!', 'success');
      this.onLoginSuccess(session);
      return session;
    } catch (error) {
      console.error('Verify SMS code error:', error);
      throw error;
    }
  }

  /**
   * Reset the current phone state
   */
  reset() {
    this.currentPhone = null;
  }
}

