import { showToast } from '../utils/toast.js';
import { ExternalWalletLogin } from '../sections/external-wallet-login.js';
import { SmsLogin } from '../sections/sms-login.js';
import { OAuthLogin } from '../sections/oauth-login.js';

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
    this.smsLogin = new SmsLogin(
      privyClient,
      this.onSmsLoginSuccess.bind(this)
    );
    this.oauthLogin = new OAuthLogin(
      privyClient,
      this.onOAuthLoginSuccess.bind(this)
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
   * Handle successful SMS login
   */
  onSmsLoginSuccess(session) {
    this.currentUser = session.user;
    this.userLoadPromise = null;
    this.closeModal();
    this.notifyAuthStateChange();
  }

  /**
   * Handle successful OAuth login
   */
  onOAuthLoginSuccess(session) {
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
    
    // SMS login elements
    const phoneInput = document.getElementById('phone-input');
    const sendSmsCodeBtn = document.getElementById('send-sms-code-btn');
    const smsOtpInput = document.getElementById('sms-otp-input');
    const verifySmsCodeBtn = document.getElementById('verify-sms-code-btn');
    const backToPhoneBtn = document.getElementById('back-to-phone-btn');
    const phoneContainer = document.getElementById('phone-input-container');
    const smsOtpContainer = document.getElementById('sms-otp-input-container');
    
    // OAuth buttons
    const googleLoginBtn = document.getElementById('google-login-btn');
    const twitterLoginBtn = document.getElementById('twitter-login-btn');
    const discordLoginBtn = document.getElementById('discord-login-btn');
    const githubLoginBtn = document.getElementById('github-login-btn');

    // Tab buttons
    const emailTabBtn = document.getElementById('email-tab-btn');
    const smsTabBtn = document.getElementById('sms-tab-btn');
    const socialTabBtn = document.getElementById('social-tab-btn');

    // External wallet login
    metamaskBtn.addEventListener('click', () => {
      this.externalWalletLogin.loginWithMetaMask();
    });

    phantomBtn.addEventListener('click', () => {
      this.externalWalletLogin.loginWithPhantom();
    });

    // OAuth login handlers
    googleLoginBtn?.addEventListener('click', () => {
      this.oauthLogin.loginWithGoogle();
    });

    twitterLoginBtn?.addEventListener('click', () => {
      this.oauthLogin.loginWithTwitter();
    });

    discordLoginBtn?.addEventListener('click', () => {
      this.oauthLogin.loginWithDiscord();
    });

    githubLoginBtn?.addEventListener('click', () => {
      this.oauthLogin.loginWithGithub();
    });

    // Tab switching
    emailTabBtn?.addEventListener('click', () => {
      this.switchTab('email');
    });

    smsTabBtn?.addEventListener('click', () => {
      this.switchTab('sms');
    });

    socialTabBtn?.addEventListener('click', () => {
      this.switchTab('social');
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
          'login-or-sign-up',
          {
            embedded: {
              ethereum: { createOnLogin: 'user-without-wallets' },
              solana: { createOnLogin: 'user-without-wallets' }
            }
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

    // SMS login handlers
    sendSmsCodeBtn?.addEventListener('click', async () => {
      const phone = phoneInput.value.trim();
      if (!phone) {
        this.showError('Please enter a phone number');
        return;
      }

      sendSmsCodeBtn.disabled = true;
      sendSmsCodeBtn.textContent = 'Sending...';
      
      try {
        await this.smsLogin.sendCode(phone);
        phoneContainer.classList.add('hidden');
        smsOtpContainer.classList.remove('hidden');
        errorDisplay.classList.add('hidden');
        
        // Focus SMS OTP input
        setTimeout(() => smsOtpInput.focus(), 100);
      } catch (error) {
        console.error('Send SMS code error:', error);
        this.showError(error.message || 'Failed to send SMS code');
      } finally {
        sendSmsCodeBtn.disabled = false;
        sendSmsCodeBtn.textContent = 'Send code';
      }
    });

    // Verify SMS code
    verifySmsCodeBtn?.addEventListener('click', async () => {
      const code = smsOtpInput.value.trim();
      if (!code) {
        this.showError('Please enter the verification code');
        return;
      }

      verifySmsCodeBtn.disabled = true;
      verifySmsCodeBtn.textContent = 'Verifying...';

      try {
        await this.smsLogin.verifyCode(code);
        // Success handled by callback
      } catch (error) {
        console.error('Verify SMS code error:', error);
        this.showError(error.message || 'Invalid code. Please try again.');
      } finally {
        verifySmsCodeBtn.disabled = false;
        verifySmsCodeBtn.textContent = 'Verify';
      }
    });

    // Back to phone
    backToPhoneBtn?.addEventListener('click', () => {
      smsOtpContainer.classList.add('hidden');
      phoneContainer.classList.remove('hidden');
      errorDisplay.classList.add('hidden');
      smsOtpInput.value = '';
      this.smsLogin.reset();
    });

    // Enter key handlers
    emailInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendCodeBtn.click();
    });
    
    otpInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') verifyCodeBtn.click();
    });

    phoneInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendSmsCodeBtn.click();
    });

    smsOtpInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') verifySmsCodeBtn.click();
    });
  }

  /**
   * Switch between authentication tabs
   */
  switchTab(tab) {
    const emailContainer = document.getElementById('email-input-container');
    const phoneContainer = document.getElementById('phone-input-container');
    const socialContainer = document.getElementById('social-login-container');
    const otpContainer = document.getElementById('otp-input-container');
    const smsOtpContainer = document.getElementById('sms-otp-input-container');
    const errorDisplay = document.getElementById('auth-error');

    const emailTabBtn = document.getElementById('email-tab-btn');
    const smsTabBtn = document.getElementById('sms-tab-btn');
    const socialTabBtn = document.getElementById('social-tab-btn');

    const modalHeader = document.querySelector('.modal-header h3');

    // Hide all containers
    emailContainer?.classList.add('hidden');
    phoneContainer?.classList.add('hidden');
    socialContainer?.classList.add('hidden');
    otpContainer?.classList.add('hidden');
    smsOtpContainer?.classList.add('hidden');
    errorDisplay?.classList.add('hidden');

    // Remove active class from all tabs
    emailTabBtn?.classList.remove('active');
    smsTabBtn?.classList.remove('active');
    socialTabBtn?.classList.remove('active');

    // Show selected tab
    switch (tab) {
      case 'email':
        emailContainer?.classList.remove('hidden');
        emailTabBtn?.classList.add('active');
        modalHeader.textContent = 'Login with Email';
        setTimeout(() => document.getElementById('email-input')?.focus(), 100);
        break;
      case 'sms':
        phoneContainer?.classList.remove('hidden');
        smsTabBtn?.classList.add('active');
        modalHeader.textContent = 'Login with SMS';
        setTimeout(() => document.getElementById('phone-input')?.focus(), 100);
        break;
      case 'social':
        socialContainer?.classList.remove('hidden');
        socialTabBtn?.classList.add('active');
        modalHeader.textContent = 'Login with Social';
        break;
    }
  }

  /**
   * Open login modal
   */
  openLoginModal() {
    const modal = document.getElementById('auth-modal');
    const emailInput = document.getElementById('email-input');
    const otpInput = document.getElementById('otp-input');
    const phoneInput = document.getElementById('phone-input');
    const smsOtpInput = document.getElementById('sms-otp-input');

    modal.classList.remove('hidden');
    
    // Reset inputs
    emailInput.value = '';
    otpInput.value = '';
    if (phoneInput) phoneInput.value = '';
    if (smsOtpInput) smsOtpInput.value = '';
    
    // Show email tab by default
    this.switchTab('email');
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

