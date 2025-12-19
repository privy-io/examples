import Privy, { LocalStorage } from '@privy-io/js-sdk-core';

let privyInstance = null;

/**
 * Initialize the Privy client
 */
export async function initPrivy() {
  if (privyInstance) {
    return privyInstance;
  }

  const appId = import.meta.env.VITE_PRIVY_APP_ID;
  const clientId = import.meta.env.VITE_PRIVY_APP_CLIENT_ID;

  if (!appId) {
    throw new Error('VITE_PRIVY_APP_ID is required. Please set it in your .env file.');
  }

  // Create Privy client instance
  const privy = new Privy({
    appId,
    clientId,
    storage: new LocalStorage()
  });

  // Setup iframe for embedded wallet
  const iframe = document.getElementById('privy-iframe');
  const iframeUrl = privy.embeddedWallet.getURL();
  iframe.src = iframeUrl;

  // Wait for iframe to load before setting up message passing
  await new Promise((resolve) => {
    iframe.onload = () => {
      privy.setMessagePoster(iframe.contentWindow);
      resolve();
    };
  });
  
  // Listen for messages from iframe with proper validation
  const messageListener = (e) => {
    // Only process messages from the Privy iframe
    if (e.source !== iframe.contentWindow) return;
    if (!e.data) return;
    
    try {
      privy.embeddedWallet.onMessage(e.data);
    } catch (error) {
      // Silently ignore invalid messages
      console.debug('Ignored message:', error);
    }
  };
  window.addEventListener('message', messageListener);

  privyInstance = privy;
  return privy;
}

/**
 * Get the current Privy instance
 */
export function getPrivy() {
  return privyInstance;
}

