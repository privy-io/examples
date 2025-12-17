import { createSection } from '../utils/section-builder.js';
import { showToast } from '../utils/toast.js';
import { startRegistration } from '@simplewebauthn/browser';

/**
 * Convert snake_case keys to camelCase recursively
 */
function toCamelCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

/**
 * Link/Unlink Accounts Section
 * Allows users to link and unlink various account types (email, phone, OAuth, wallets, passkeys)
 */
export class LinkAccounts {
  constructor(privyClient) {
    this.privy = privyClient;
    this.setupLinkModal();
  }

  /**
   * Setup link/unlink modal
   */
  setupLinkModal() {
    // Check if modal already exists
    if (document.getElementById('link-modal')) return;

    // Create modal HTML
    const modalHTML = `
      <div id="link-modal" class="modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="link-modal-title">Link Account</h3>
            <button id="link-modal-close" class="close-button">&times;</button>
          </div>
          <div id="link-modal-body" class="modal-body"></div>
          <div id="link-modal-error" class="error-message hidden"></div>
        </div>
      </div>
    `;

    // Append to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Setup close handlers
    const modal = document.getElementById('link-modal');
    const closeBtn = document.getElementById('link-modal-close');
    
    closeBtn.addEventListener('click', () => this.closeLinkModal());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeLinkModal();
    });
  }

  /**
   * Open link modal
   */
  openLinkModal(title, bodyHTML) {
    const modal = document.getElementById('link-modal');
    const modalTitle = document.getElementById('link-modal-title');
    const modalBody = document.getElementById('link-modal-body');
    const errorDisplay = document.getElementById('link-modal-error');

    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHTML;
    errorDisplay.classList.add('hidden');
    modal.classList.remove('hidden');
  }

  /**
   * Close link modal
   */
  closeLinkModal() {
    const modal = document.getElementById('link-modal');
    modal.classList.add('hidden');
  }

  /**
   * Show error in link modal
   */
  showLinkError(message) {
    const errorDisplay = document.getElementById('link-modal-error');
    errorDisplay.textContent = message;
    errorDisplay.classList.remove('hidden');
  }

  render(user, onUpdate) {
    const linkedAccountsCount = user.linked_accounts?.length || 0;
    const description = `Link additional accounts to your profile. Currently linked: ${linkedAccountsCount} account(s)`;

    const actions = [
      // Link Email
      {
        name: 'Link Email',
        function: () => {
          this.openLinkModal('Link Email Address', `
            <label for="link-email-input">Email Address</label>
            <input type="email" id="link-email-input" placeholder="Enter your email" />
            <button id="link-email-send-btn" class="button-primary full-width">Send Code</button>
            
            <div id="link-email-code-container" class="hidden" style="margin-top: 1rem;">
              <label for="link-email-code-input">Enter 6-digit code</label>
              <input type="text" id="link-email-code-input" placeholder="000000" maxlength="6" />
              <button id="link-email-verify-btn" class="button-primary full-width">Link Email</button>
            </div>
          `);

          setTimeout(() => {
            const emailInput = document.getElementById('link-email-input');
            const sendBtn = document.getElementById('link-email-send-btn');
            const codeContainer = document.getElementById('link-email-code-container');
            const codeInput = document.getElementById('link-email-code-input');
            const verifyBtn = document.getElementById('link-email-verify-btn');

            sendBtn.addEventListener('click', async () => {
              const email = emailInput.value.trim();
              if (!email) {
                this.showLinkError('Please enter an email address');
                return;
              }

              sendBtn.disabled = true;
              sendBtn.textContent = 'Sending...';

              try {
                await this.privy.auth.email.sendCode(email);
                showToast('Code sent! Check your email.', 'success');
                codeContainer.classList.remove('hidden');
                emailInput.disabled = true;
                sendBtn.classList.add('hidden');
              } catch (error) {
                console.error('Send email code error:', error);
                this.showLinkError(error.message || 'Failed to send code');
                sendBtn.disabled = false;
                sendBtn.textContent = 'Send Code';
              }
            });

            verifyBtn.addEventListener('click', async () => {
              const code = codeInput.value.trim();
              const email = emailInput.value.trim();
              
              if (!code) {
                this.showLinkError('Please enter the verification code');
                return;
              }

              verifyBtn.disabled = true;
              verifyBtn.textContent = 'Linking...';

              try {
                await this.privy.auth.email.linkWithCode(email, code);
                showToast('Email linked successfully!', 'success');
                this.closeLinkModal();
                onUpdate();
              } catch (error) {
                console.error('Link email error:', error);
                this.showLinkError(error.message || 'Failed to link email');
                verifyBtn.disabled = false;
                verifyBtn.textContent = 'Link Email';
              }
            });
          }, 100);
        }
      },

      // Link Phone
      {
        name: 'Link Phone',
        function: () => {
          this.openLinkModal('Link Phone Number', `
            <label for="link-phone-input">Phone Number (with country code)</label>
            <input type="tel" id="link-phone-input" placeholder="+1234567890" />
            <button id="link-phone-send-btn" class="button-primary full-width">Send Code</button>
            
            <div id="link-phone-code-container" class="hidden" style="margin-top: 1rem;">
              <label for="link-phone-code-input">Enter 6-digit code</label>
              <input type="text" id="link-phone-code-input" placeholder="000000" maxlength="6" />
              <button id="link-phone-verify-btn" class="button-primary full-width">Link Phone</button>
            </div>
          `);

          setTimeout(() => {
            const phoneInput = document.getElementById('link-phone-input');
            const sendBtn = document.getElementById('link-phone-send-btn');
            const codeContainer = document.getElementById('link-phone-code-container');
            const codeInput = document.getElementById('link-phone-code-input');
            const verifyBtn = document.getElementById('link-phone-verify-btn');

            sendBtn.addEventListener('click', async () => {
              const phone = phoneInput.value.trim();
              if (!phone) {
                this.showLinkError('Please enter a phone number');
                return;
              }

              sendBtn.disabled = true;
              sendBtn.textContent = 'Sending...';

              try {
                await this.privy.auth.phone.sendCode(phone);
                showToast('SMS code sent! Check your phone.', 'success');
                codeContainer.classList.remove('hidden');
                phoneInput.disabled = true;
                sendBtn.classList.add('hidden');
              } catch (error) {
                console.error('Send SMS code error:', error);
                this.showLinkError(error.message || 'Failed to send SMS code');
                sendBtn.disabled = false;
                sendBtn.textContent = 'Send Code';
              }
            });

            verifyBtn.addEventListener('click', async () => {
              const code = codeInput.value.trim();
              const phone = phoneInput.value.trim();
              
              if (!code) {
                this.showLinkError('Please enter the verification code');
                return;
              }

              verifyBtn.disabled = true;
              verifyBtn.textContent = 'Linking...';

              try {
                await this.privy.auth.phone.linkWithCode(phone, code);
                showToast('Phone linked successfully!', 'success');
                this.closeLinkModal();
                onUpdate();
              } catch (error) {
                console.error('Link phone error:', error);
                this.showLinkError(error.message || 'Failed to link phone');
                verifyBtn.disabled = false;
                verifyBtn.textContent = 'Link Phone';
              }
            });
          }, 100);
        }
      },

      // Link Google
      {
        name: 'Link Google',
        function: async () => {
          try {
            const redirectURI = window.location.href.split('?')[0];
            const { url } = await this.privy.auth.oauth.generateURL('google', redirectURI);
            
            // Store that we're linking (not logging in)
            sessionStorage.setItem('privy_oauth_action', 'link');
            sessionStorage.setItem('privy_oauth_provider', 'google');
            
            window.location.href = url;
          } catch (error) {
            console.error('Link Google error:', error);
            showToast(error.message || 'Failed to initiate Google link', 'error');
          }
        }
      },

      // Link Twitter
      {
        name: 'Link Twitter',
        function: async () => {
          try {
            const redirectURI = window.location.href.split('?')[0];
            const { url } = await this.privy.auth.oauth.generateURL('twitter', redirectURI);
            
            sessionStorage.setItem('privy_oauth_action', 'link');
            sessionStorage.setItem('privy_oauth_provider', 'twitter');
            
            window.location.href = url;
          } catch (error) {
            console.error('Link Twitter error:', error);
            showToast(error.message || 'Failed to initiate Twitter link', 'error');
          }
        }
      },

      // Link Discord
      {
        name: 'Link Discord',
        function: async () => {
          try {
            const redirectURI = window.location.href.split('?')[0];
            const { url } = await this.privy.auth.oauth.generateURL('discord', redirectURI);
            
            sessionStorage.setItem('privy_oauth_action', 'link');
            sessionStorage.setItem('privy_oauth_provider', 'discord');
            
            window.location.href = url;
          } catch (error) {
            console.error('Link Discord error:', error);
            showToast(error.message || 'Failed to initiate Discord link', 'error');
          }
        }
      },

      // Link GitHub
      {
        name: 'Link GitHub',
        function: async () => {
          try {
            const redirectURI = window.location.href.split('?')[0];
            const { url } = await this.privy.auth.oauth.generateURL('github', redirectURI);
            
            sessionStorage.setItem('privy_oauth_action', 'link');
            sessionStorage.setItem('privy_oauth_provider', 'github');
            
            window.location.href = url;
          } catch (error) {
            console.error('Link GitHub error:', error);
            showToast(error.message || 'Failed to initiate GitHub link', 'error');
          }
        }
      },

      // Link Passkey
      {
        name: 'Link Passkey',
        function: async () => {
          try {
            // Step 1: Get registration options from Privy
            const response = await this.privy.auth.passkey.generateRegistrationOptions();

            // Extract and convert options from snake_case to camelCase
            const options = toCamelCase(response.options);

            // Step 2: Prompt user to create passkey using browser WebAuthn API
            const registrationResponse = await startRegistration(options);

            // Step 3: Link the passkey to user's account
            await this.privy.auth.passkey.linkWithPasskey(registrationResponse);

            showToast('Passkey linked successfully!', 'success');
            onUpdate();
          } catch (error) {
            console.error('Link passkey error:', error);
            
            // Handle specific errors
            if (error.name === 'NotAllowedError') {
              showToast('Passkey creation was cancelled or timed out', 'error');
            } else if (error.name === 'InvalidStateError') {
              showToast('This passkey is already registered', 'error');
            } else if (error.name === 'NotSupportedError') {
              showToast('Passkeys are not supported on this device/browser', 'error');
            } else {
              showToast(error.message || 'Failed to link passkey', 'error');
            }
          }
        }
      }
    ];

    return createSection({
      name: 'Link Accounts',
      description,
      filepath: 'src/sections/link-accounts.js',
      actions
    });
  }
}

