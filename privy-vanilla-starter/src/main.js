import './polyfills.js'; // Must be first
import './style.css';
import { initPrivy } from './lib/privy-client.js';
import { initUI } from './ui/ui-manager.js';
import { mfaModal } from './utils/mfa-modal.js';

// Initialize the app
async function init() {
  try {
    // Initialize Privy client
    const privyClient = await initPrivy();
    
    // Setup global MFA modal
    mfaModal.setup();
    
    // Initialize UI with Privy client
    initUI(privyClient);
  } catch (error) {
    console.error('Failed to initialize app:', error);
    document.getElementById('loading-screen').innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <h2 style="color: #ef4444; margin-bottom: 1rem;">Initialization Error</h2>
        <p style="color: #6b7280;">Please check your .env file and ensure VITE_PRIVY_APP_ID is set.</p>
        <p style="color: #6b7280; margin-top: 0.5rem; font-size: 0.875rem;">${error.message}</p>
    </div>
    `;
  }
}

// Start the app
init();
