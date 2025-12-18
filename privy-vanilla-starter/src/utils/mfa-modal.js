import { showToast } from './toast.js';
import { startAuthentication } from '@simplewebauthn/browser';

/**
 * Shared MFA Modal Utility
 * Provides a consistent MFA verification modal used across the app
 */
class MfaModalManager {
  constructor() {
    this.initialized = false;
  }

  /**
   * Setup the global MFA modal (call once on app init)
   */
  setup() {
    if (this.initialized || document.getElementById('mfa-modal')) return;

    const modalHTML = `
      <div id="mfa-modal" class="modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="mfa-modal-title">MFA Enrollment</h3>
            <button id="mfa-modal-close" class="close-button">&times;</button>
          </div>
          <div id="mfa-modal-body" class="modal-body"></div>
          <div id="mfa-modal-error" class="error-message hidden"></div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('mfa-modal');
    const closeBtn = document.getElementById('mfa-modal-close');
    
    closeBtn.addEventListener('click', () => this.close());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });

    this.initialized = true;
  }

  /**
   * Open the MFA modal with custom content
   */
  open(title, bodyHTML) {
    const modal = document.getElementById('mfa-modal');
    const modalTitle = document.getElementById('mfa-modal-title');
    const modalBody = document.getElementById('mfa-modal-body');
    const errorDisplay = document.getElementById('mfa-modal-error');

    if (modal && modalTitle && modalBody && errorDisplay) {
      modalTitle.textContent = title;
      modalBody.innerHTML = bodyHTML;
      errorDisplay.classList.add('hidden');
      modal.classList.remove('hidden');
    }
  }

  /**
   * Close the MFA modal
   */
  close() {
    const modal = document.getElementById('mfa-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  /**
   * Show error message in the modal
   */
  showError(message) {
    const errorDisplay = document.getElementById('mfa-modal-error');
    if (errorDisplay) {
      errorDisplay.textContent = message;
      errorDisplay.classList.remove('hidden');
    }
  }

  /**
   * Handle MFA verification when required
   * @param {Object} privyClient - Privy client instance
   * @param {Object} user - Current user object
   * @returns {Promise} Resolves when MFA is verified
   */
  async handleVerification(privyClient, user) {
    return new Promise((resolve, reject) => {
      // Determine which MFA method to use
      const mfaMethods = user?.mfa_methods || [];
      const hasTotp = mfaMethods.some(m => m.type === 'totp');
      const hasSms = mfaMethods.some(m => m.type === 'sms');
      const hasPasskey = mfaMethods.some(m => m.type === 'passkey');

      let verificationHtml = '<p>This action requires MFA verification.</p>';

      if (hasTotp) {
        verificationHtml += `
          <label for="mfa-verify-code">Enter TOTP code from your authenticator</label>
          <input type="text" id="mfa-verify-code" placeholder="000000" maxlength="6" />
          <button id="mfa-verify-btn" class="button-primary full-width">Verify</button>
        `;
      } else if (hasSms) {
        const phoneNumber = mfaMethods.find(m => m.type === 'sms')?.verified_at ? 'your phone' : 'phone';
        verificationHtml += `
          <button id="mfa-send-sms-btn" class="button-primary full-width">Send SMS Code to ${phoneNumber}</button>
          <div id="mfa-sms-verify-container" class="hidden" style="margin-top: 1rem;">
            <label for="mfa-verify-code">Enter SMS code</label>
            <input type="text" id="mfa-verify-code" placeholder="000000" maxlength="6" />
            <button id="mfa-verify-btn" class="button-primary full-width">Verify</button>
          </div>
        `;
      } else if (hasPasskey) {
        verificationHtml += `
          <p>Complete the passkey prompt to verify.</p>
          <button id="mfa-verify-passkey-btn" class="button-primary full-width">Verify with Passkey</button>
        `;
      } else {
        reject(new Error('No MFA methods enrolled'));
        return;
      }

      this.open('MFA Verification Required', verificationHtml);

      // Handle SMS send button
      const sendSmsBtn = document.getElementById('mfa-send-sms-btn');
      if (sendSmsBtn) {
        sendSmsBtn.addEventListener('click', async () => {
          try {
            await privyClient.mfa.sms.sendCode({ phoneNumber: '' }); // Server knows the phone
            document.getElementById('mfa-sms-verify-container').classList.remove('hidden');
            showToast('SMS code sent', 'success');
          } catch (error) {
            this.showError(error.message || 'Failed to send SMS code');
          }
        });
      }

      // Handle TOTP/SMS verification button
      const verifyBtn = document.getElementById('mfa-verify-btn');
      if (verifyBtn) {
        verifyBtn.addEventListener('click', async () => {
          const code = document.getElementById('mfa-verify-code').value;
          if (!code) {
            this.showError('Please enter the verification code');
            return;
          }

          try {
            // Determine which MFA method to use
            const mfaMethod = hasTotp ? 'totp' : 'sms';
            
            // Submit MFA verification by resolving the rootPromise
            if (privyClient.mfaPromises.rootPromise.current) {
              privyClient.mfaPromises.rootPromise.current.resolve({
                mfaMethod,
                mfaCode: code,
                relyingParty: window.location.hostname
              });
            }
            
            this.close();
            showToast('MFA verified successfully', 'success');
            resolve();
          } catch (error) {
            console.error('MFA verification error:', error);
            this.showError(error.message || 'Invalid verification code');
            reject(error);
          }
        });
      }

      // Handle Passkey verification button
      const passkeyBtn = document.getElementById('mfa-verify-passkey-btn');
      if (passkeyBtn) {
        passkeyBtn.addEventListener('click', async () => {
          try {
            // Get passkey authentication options
            const { options } = await privyClient.mfa.passkey.generateAuthenticationOptions({});
            
            // Start passkey authentication
            const response = await startAuthentication(options);
            
            // Submit MFA verification by resolving the rootPromise
            if (privyClient.mfaPromises.rootPromise.current) {
              privyClient.mfaPromises.rootPromise.current.resolve({
                mfaMethod: 'passkey',
                mfaCode: response,
                relyingParty: window.location.hostname
              });
            }
            
            this.close();
            showToast('MFA verified successfully', 'success');
            resolve();
          } catch (error) {
            console.error('Passkey MFA verification error:', error);
            this.showError(error.message || 'Passkey verification failed');
            reject(error);
          }
        });
      }
    });
  }
}

// Export a singleton instance
export const mfaModal = new MfaModalManager();

