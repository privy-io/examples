import { showToast } from '../utils/toast.js';

/**
 * OAuth Login Handler
 * 
 * Note: The Core JS SDK OAuth flow uses full-page redirects rather than popups.
 * The flow is:
 * 1. User clicks OAuth button
 * 2. Page redirects to OAuth provider (Google, Twitter, etc.)
 * 3. User authenticates with provider
 * 4. Provider redirects to Privy's callback
 * 5. Privy redirects back to our app with code and state
 * 6. We complete the login with the code and state
 */
export class OAuthLogin {
  constructor(privy, onLoginSuccess) {
    this.privy = privy;
    this.onLoginSuccess = onLoginSuccess;
    this.checkForOAuthCallback();
  }

  /**
   * Check if we just returned from an OAuth callback
   */
  async checkForOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Privy returns OAuth parameters with 'privy_oauth_' prefix
    const authorizationCode = urlParams.get('privy_oauth_code');
    const stateCode = urlParams.get('privy_oauth_state');
    const provider = urlParams.get('privy_oauth_provider');
    const error = urlParams.get('privy_oauth_error') || urlParams.get('error');
    const errorDescription = urlParams.get('privy_oauth_error_description') || urlParams.get('error_description');

    if (error) {
      console.error('OAuth error:', error, errorDescription);
      showToast(`OAuth error: ${errorDescription || error}`, 'error');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (authorizationCode && stateCode) {
      try {
        console.log('Processing OAuth callback...', { provider });
        showToast('Completing login...', 'success');

        // Complete the OAuth login
        const session = await this.privy.auth.oauth.loginWithCode(
          authorizationCode,
          stateCode,
          provider, // provider from URL
          undefined, // codeType
          'login-or-sign-up',
          {
            embedded: {
              ethereum: { createOnLogin: 'user-without-wallets' },
              solana: { createOnLogin: 'user-without-wallets' }
            }
          }
        );

        console.log('OAuth login successful:', session.user);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Notify success
        this.onLoginSuccess(session);
        showToast('Login successful!', 'success');
      } catch (error) {
        console.error('OAuth login error:', error);
        showToast(`Login failed: ${error.message}`, 'error');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }

  /**
   * Initialize OAuth login flow (full-page redirect)
   * @param {string} provider - The OAuth provider (e.g., 'google', 'twitter', 'discord', 'github')
   */
  async loginWithOAuth(provider) {
    try {
      console.log(`Initiating ${provider} OAuth login...`);

      // Use the current page as the redirect URI
      const redirectURI = window.location.href.split('?')[0];
      
      // Get the OAuth URL from Privy
      const { url } = await this.privy.auth.oauth.generateURL(provider, redirectURI);

      console.log(`${provider} OAuth URL:`, url);
      console.log('Redirecting to OAuth provider...');

      // Redirect to OAuth provider (full-page redirect)
      window.location.href = url;

    } catch (error) {
      console.error(`${provider} OAuth login error:`, error);
      showToast(`${provider} login failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Login with Google
   */
  async loginWithGoogle() {
    return this.loginWithOAuth('google');
  }

  /**
   * Login with Twitter
   */
  async loginWithTwitter() {
    return this.loginWithOAuth('twitter');
  }

  /**
   * Login with Discord
   */
  async loginWithDiscord() {
    return this.loginWithOAuth('discord');
  }

  /**
   * Login with GitHub
   */
  async loginWithGithub() {
    return this.loginWithOAuth('github');
  }

  /**
   * Login with Apple
   */
  async loginWithApple() {
    return this.loginWithOAuth('apple');
  }

  /**
   * Login with LinkedIn
   */
  async loginWithLinkedin() {
    return this.loginWithOAuth('linkedin');
  }

  /**
   * Login with Spotify
   */
  async loginWithSpotify() {
    return this.loginWithOAuth('spotify');
  }

  /**
   * Login with TikTok
   */
  async loginWithTiktok() {
    return this.loginWithOAuth('tiktok');
  }
}

