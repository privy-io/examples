import { showToast } from '../utils/toast.js';
import { ExternalWalletLogin } from '../sections/external-wallet-login.js';

/**
 * Manages authentication flow
 */
export class AuthManager {
  constructor(privyClient) {
    this.privy = privyClient;
    this.authStateListeners = [];
    this.currentUser = null;
    this.userLoadPromise = null;
    this.externalWalletLogin = new ExternalWalletLogin(
      privyClient,
      this.onExternalWalletLoginSuccess.bind(this)
    );
    this.setupModal();
  }

  /**
   * Handle successful external wallet login
   */
  onExternalWalletLoginSuccess(session) {
    this.currentUser = session.user;
    this.userLoadPromise = null;
    this.closeModal();
    this.notifyAuthStateChange();
  }

  /**
   * Load user from Privy on init
   */
  async loadUser() {
    if (!this.userLoadPromise) {
      this.userLoadPromise = (async () => {
        try {
          // Get user from Privy
          const result = await this.privy.user.get();
          this.currentUser = result.user;
        } catch (error) {
          // User not logged in
          this.currentUser = null;
        }
      })();
    }
    return this.userLoadPromise;
  }

  /**
   * Setup auth modal and event listeners
   */
  setupModal() {
    const modal = document.getElementById('auth-modal');
    const closeBtn = document.getElementById('close-modal');
    const emailInput = document.getElementById('email-input');
    const sendCodeBtn = document.getElementById('send-code-btn');
    const otpInput = document.getElementById('otp-input');
    const verifyCodeBtn = document.getElementById('verify-code-btn');
    const backToEmailBtn = document.getElementById('back-to-email-btn');
    const emailContainer = document.getElementById('email-input-container');
    const otpContainer = document.getElementById('otp-input-container');
    const errorDisplay = document.getElementById('auth-error');
    const metamaskBtn = document.getElementById('metamask-login-btn');
    const phantomBtn = document.getElementById('phantom-login-btn');

    // External wallet login
    metamaskBtn.addEventListener('click', () => {
      this.externalWalletLogin.loginWithMetaMask();
    });

    phantomBtn.addEventListener('click', () => {
      this.externalWalletLogin.loginWithPhantom();
    });

    // Close modal
    closeBtn.addEventListener('click', () => this.closeModal());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeModal();
    });

    // Send code
    sendCodeBtn.addEventListener('click', async () => {
      const email = emailInput.value.trim();
      if (!email) {
        this.showError('Please enter an email address');
        return;
      }

      sendCodeBtn.disabled = true;
      sendCodeBtn.textContent = 'Sending...';
      
      try {
        await this.privy.auth.email.sendCode(email);
        this.currentEmail = email;
        emailContainer.classList.add('hidden');
        otpContainer.classList.remove('hidden');
        errorDisplay.classList.add('hidden');
        showToast('Code sent! Check your email', 'success');
        
        // Focus OTP input
        setTimeout(() => otpInput.focus(), 100);
      } catch (error) {
        console.error('Send code error:', error);
        this.showError(error.message || 'Failed to send code');
      } finally {
        sendCodeBtn.disabled = false;
        sendCodeBtn.textContent = 'Send code';
      }
    });

    // Verify code
    verifyCodeBtn.addEventListener('click', async () => {
      const code = otpInput.value.trim();
      if (!code) {
        this.showError('Please enter the verification code');
        return;
      }

      verifyCodeBtn.disabled = true;
      verifyCodeBtn.textContent = 'Verifying...';

      try {
        const session = await this.privy.auth.email.loginWithCode(
          this.currentEmail,
          code,
          undefined,
          {
            ethereum: { createOnLogin: 'user-without-wallets' },
            solana: { createOnLogin: 'user-without-wallets' }
          }
        );
        
        // Update local user state
        this.currentUser = session.user;
        // Reset load promise so next getUser() call won't use stale data
        this.userLoadPromise = null;
        
        showToast('Login successful!', 'success');
        this.closeModal();
        this.notifyAuthStateChange();
      } catch (error) {
        console.error('Verify code error:', error);
        this.showError(error.message || 'Invalid code. Please try again.');
      } finally {
        verifyCodeBtn.disabled = false;
        verifyCodeBtn.textContent = 'Verify';
      }
    });

    // Back to email
    backToEmailBtn.addEventListener('click', () => {
      otpContainer.classList.add('hidden');
      emailContainer.classList.remove('hidden');
      errorDisplay.classList.add('hidden');
      otpInput.value = '';
    });

    // Enter key handlers
    emailInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendCodeBtn.click();
    });
    
    otpInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') verifyCodeBtn.click();
    });
  }

  /**
   * Open login modal
   */
  openLoginModal() {
    const modal = document.getElementById('auth-modal');
    const emailContainer = document.getElementById('email-input-container');
    const otpContainer = document.getElementById('otp-input-container');
    const errorDisplay = document.getElementById('auth-error');
    const emailInput = document.getElementById('email-input');
    const otpInput = document.getElementById('otp-input');

    modal.classList.remove('hidden');
    emailContainer.classList.remove('hidden');
    otpContainer.classList.add('hidden');
    errorDisplay.classList.add('hidden');
    emailInput.value = '';
    otpInput.value = '';
    
    // Focus email input
    setTimeout(() => emailInput.focus(), 100);
  }

  /**
   * Close login modal
   */
  closeModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.add('hidden');
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorDisplay = document.getElementById('auth-error');
    errorDisplay.textContent = message;
    errorDisplay.classList.remove('hidden');
  }

  /**
   * Get current user
   */
  async getUser() {
    // Wait for initial load to complete
    await this.loadUser();
    return this.currentUser;
  }

  /**
   * Logout
   */
  async logout() {
    try {
      await this.privy.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear local state
    this.currentUser = null;
    this.userLoadPromise = null;
    this.notifyAuthStateChange();
  }

  /**
   * Register auth state change listener
   */
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
  }

  /**
   * Notify all listeners of auth state change
   */
  notifyAuthStateChange() {
    this.authStateListeners.forEach(callback => callback());
  }
}

