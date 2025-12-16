// Polyfills for browser compatibility
import { Buffer } from 'buffer';

// Make Buffer available globally
window.Buffer = Buffer;
globalThis.Buffer = Buffer;

// Export for explicit imports
export { Buffer };

