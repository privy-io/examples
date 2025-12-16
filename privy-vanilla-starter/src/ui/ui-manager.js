import { AuthManager } from './auth-manager.js';
import { SectionsManager } from './sections-manager.js';
import { showToast } from '../utils/toast.js';

/**
 * Main UI Manager - orchestrates all UI components
 */
export function initUI(privyClient) {
  const elements = {
    loadingScreen: document.getElementById('loading-screen'),
    loginScreen: document.getElementById('login-screen'),
    authenticatedScreen: document.getElementById('authenticated-screen'),
    header: document.getElementById('header'),
    headerLogo: document.getElementById('header-logo'),
    demoBadge: document.getElementById('demo-badge'),
    docsLink: document.querySelector('.docs-link'),
    logoutBtn: document.getElementById('logout-btn'),
    userObject: document.getElementById('user-object'),
  };

  // Initialize managers
  const authManager = new AuthManager(privyClient);
  const sectionsManager = new SectionsManager(privyClient);

  // Check initial auth state
  checkAuthState();

  // Setup logout handler
  elements.logoutBtn.addEventListener('click', async () => {
    try {
      await authManager.logout();
      showToast('Logged out successfully', 'success');
      checkAuthState();
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Failed to logout', 'error');
    }
  });

  // Listen for auth state changes
  authManager.onAuthStateChange(() => {
    checkAuthState();
  });

  /**
   * Check authentication state and update UI
   */
  async function checkAuthState() {
    elements.loadingScreen.classList.add('hidden');
    
    const user = await authManager.getUser();
    
    if (user) {
      showAuthenticatedUI(user);
    } else {
      showLoginUI();
    }
  }

  /**
   * Show login UI
   */
  function showLoginUI() {
    elements.loginScreen.classList.remove('hidden');
    elements.authenticatedScreen.classList.add('hidden');
    elements.header.classList.remove('authenticated');
    elements.header.classList.add('unauthenticated');
    elements.headerLogo.src = '/privy-logo-white.svg';
    elements.demoBadge.classList.add('hidden', 'white');
    elements.docsLink.classList.add('white');

    // Setup login button
    const loginBtn = document.getElementById('login-btn');
    loginBtn.onclick = () => {
      authManager.openLoginModal();
    };
  }

  /**
   * Show authenticated UI
   */
  function showAuthenticatedUI(user) {
    elements.loginScreen.classList.add('hidden');
    elements.authenticatedScreen.classList.remove('hidden');
    elements.header.classList.add('authenticated');
    elements.header.classList.remove('unauthenticated');
    elements.headerLogo.src = '/privy-logo-black.svg';
    elements.demoBadge.classList.remove('hidden', 'white');
    elements.docsLink.classList.remove('white');

    // Update user object display
    elements.userObject.textContent = JSON.stringify(user, null, 2);

    // Render sections
    sectionsManager.renderSections(user);
  }
}

