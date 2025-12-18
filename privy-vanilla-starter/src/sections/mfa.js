import { createSection } from '../utils/section-builder.js';
import { showToast } from '../utils/toast.js';
import { mfaModal } from '../utils/mfa-modal.js';

/**
 * MFA (Multi-Factor Authentication) Section
 * Allows users to enroll and unenroll MFA methods: SMS, TOTP, and Passkey
 */
export class MFA {
  constructor(privyClient) {
    this.privy = privyClient;
  }

  render(user, onUpdate) {
    // Check current MFA status
    // mfa_methods is an array of objects like [{type: 'totp', ...}, {type: 'sms', ...}]
    const hasSms = user?.mfa_methods?.some(m => m.type === 'sms') || false;
    const hasTotp = user?.mfa_methods?.some(m => m.type === 'totp') || false;
    const hasPasskey = user?.mfa_methods?.some(m => m.type === 'passkey') || false;

    const mfaStatus = `Currently enrolled: ${
      [
        hasSms && 'SMS',
        hasTotp && 'TOTP',
        hasPasskey && 'Passkey'
      ].filter(Boolean).join(', ') || 'None'
    }`;

    const actions = [
      // Enroll SMS MFA
      {
        name: hasSms ? '✓ SMS MFA Enrolled' : 'Enroll SMS MFA',
        function: async () => {
          if (hasSms) {
            showToast('SMS MFA is already enrolled', 'info');
            return;
          }

          mfaModal.open('Enroll SMS MFA', `
            <label for="mfa-sms-phone">Phone Number</label>
            <input type="tel" id="mfa-sms-phone" placeholder="+1234567890" />
            <button id="mfa-sms-send-btn" class="button-primary full-width">Send Code</button>
            
            <div id="mfa-sms-code-container" class="hidden" style="margin-top: 1rem;">
              <label for="mfa-sms-code">Enter 6-digit code</label>
              <input type="text" id="mfa-sms-code" placeholder="000000" maxlength="6" />
              <button id="mfa-sms-verify-btn" class="button-primary full-width">Enroll SMS MFA</button>
            </div>
          `);

          document.getElementById('mfa-sms-send-btn').addEventListener('click', async () => {
            const phoneNumber = document.getElementById('mfa-sms-phone').value;
            if (!phoneNumber) {
              mfaModal.showError('Please enter a phone number');
              return;
            }

            try {
              await this.privy.mfa.initEnrollMfa({ method: 'sms', phoneNumber });
              showToast('Code sent to your phone', 'success');
              document.getElementById('mfa-sms-code-container').classList.remove('hidden');
            } catch (error) {
              console.error('Send SMS code error:', error);
              this.showMfaError(error.message || 'Failed to send code');
            }
          });

          document.getElementById('mfa-sms-verify-btn').addEventListener('click', async () => {
            const phoneNumber = document.getElementById('mfa-sms-phone').value;
            const code = document.getElementById('mfa-sms-code').value;

            try {
              await this.privy.mfa.submitEnrollMfa({ method: 'sms', phoneNumber, code });
              showToast('SMS MFA enrolled successfully!', 'success');
              mfaModal.close();
              onUpdate();
            } catch (error) {
              console.error('Enroll SMS MFA error:', error);
              this.showMfaError(error.message || 'Failed to enroll SMS MFA');
            }
          });
        }
      },

      // Enroll TOTP MFA
      {
        name: hasTotp ? '✓ TOTP MFA Enrolled' : 'Enroll TOTP MFA',
        function: async () => {
          if (hasTotp) {
            showToast('TOTP MFA is already enrolled', 'info');
            return;
          }

          try {
            const { authUrl, secret } = await this.privy.mfa.initEnrollMfa({ method: 'totp' });
            
            // Generate QR code image URL from the otpauth:// URL
            // Using qrserver.com free API to generate QR code
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(authUrl)}`;
            
            mfaModal.open('Enroll TOTP MFA', `
              <p>Scan this QR code with your authenticator app:</p>
              <div style="text-align: center; margin: 1rem 0;">
                <img src="${qrCodeUrl}" alt="TOTP QR Code" style="max-width: 200px; border: 1px solid #ccc; padding: 10px; background: white;" />
              </div>
              <p style="font-size: 0.875rem; color: #666;">
                Or manually enter this secret: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px;">${secret}</code>
              </p>
              
              <label for="mfa-totp-code">Enter 6-digit code from authenticator</label>
              <input type="text" id="mfa-totp-code" placeholder="000000" maxlength="6" />
              <button id="mfa-totp-verify-btn" class="button-primary full-width">Enroll TOTP MFA</button>
            `);

            document.getElementById('mfa-totp-verify-btn').addEventListener('click', async () => {
              const code = document.getElementById('mfa-totp-code').value;

              try {
                await this.privy.mfa.submitEnrollMfa({ method: 'totp', code });
                showToast('TOTP MFA enrolled successfully!', 'success');
                mfaModal.close();
                onUpdate();
              } catch (error) {
                console.error('Enroll TOTP MFA error:', error);
                this.showMfaError(error.message || 'Failed to enroll TOTP MFA');
              }
            });
          } catch (error) {
            console.error('Init TOTP enrollment error:', error);
            showToast(error.message || 'Failed to initialize TOTP enrollment', 'error');
          }
        }
      },

      // Enroll Passkey MFA
      {
        name: hasPasskey ? '✓ Passkey MFA Enrolled' : 'Enroll Passkey MFA',
        function: async () => {
          if (hasPasskey) {
            showToast('Passkey MFA is already enrolled', 'info');
            return;
          }

          try {
            // Get passkey accounts from user's linked accounts
            const passkeyAccounts = user?.linked_accounts?.filter(
              account => account.type === 'passkey'
            ) || [];

            if (passkeyAccounts.length === 0) {
              showToast('Please link a passkey first before enrolling in MFA', 'error');
              return;
            }

            // Extract credential IDs from passkey accounts
            const credentialIds = passkeyAccounts.map(account => account.credential_id);

            // Enroll the passkeys for MFA
            await this.privy.mfa.submitEnrollMfa({ 
              method: 'passkey', 
              credentialIds 
            });

            showToast('Passkey MFA enrolled successfully!', 'success');
            onUpdate();
          } catch (error) {
            console.error('Enroll Passkey MFA error:', error);
            showToast(error.message || 'Failed to enroll Passkey MFA', 'error');
          }
        }
      },

      // Unenroll SMS MFA
      {
        name: 'Unenroll SMS MFA',
        function: async () => {
          if (!hasSms) {
            showToast('SMS MFA is not enrolled', 'info');
            return;
          }

          if (!confirm('Are you sure you want to unenroll SMS MFA? You will need to verify with MFA first.')) {
            return;
          }

          try {
            console.log('Starting SMS MFA unenrollment...');
            showToast('Starting unenrollment...', 'info');

            // Set up MFA listener
            const mfaListener = async () => {
              console.log('MFA verification required');
              try {
                await mfaModal.handleVerification(this.privy, user);
              } catch (error) {
                console.error('MFA verification failed:', error);
                throw error;
              }
            };

            // Listen for MFA required event
            this.privy.mfaPromises.on('mfaRequired', mfaListener);

            try {
              // Attempt to unenroll (will trigger MFA requirement)
              await this.privy.mfa.unenrollMfa('sms');
              showToast('SMS MFA unenrolled successfully!', 'success');
              onUpdate();
            } finally {
              // Clean up listener
              this.privy.mfaPromises.off('mfaRequired', mfaListener);
            }
          } catch (error) {
            console.error('Unenroll SMS MFA error:', error);
            showToast(error.message || 'Failed to unenroll SMS MFA', 'error');
          }
        }
      },

      // Unenroll TOTP MFA
      {
        name: 'Unenroll TOTP MFA',
        function: async () => {
          if (!hasTotp) {
            showToast('TOTP MFA is not enrolled', 'info');
            return;
          }

          if (!confirm('Are you sure you want to unenroll TOTP MFA? You will need to verify with MFA first.')) {
            return;
          }

          try {
            console.log('Starting TOTP MFA unenrollment...');
            showToast('Starting unenrollment...', 'info');

            // Set up MFA listener
            const mfaListener = async () => {
              console.log('MFA verification required');
              try {
                await mfaModal.handleVerification(this.privy, user);
              } catch (error) {
                console.error('MFA verification failed:', error);
                throw error;
              }
            };

            // Listen for MFA required event
            this.privy.mfaPromises.on('mfaRequired', mfaListener);

            try {
              // Attempt to unenroll (will trigger MFA requirement)
              await this.privy.mfa.unenrollMfa('totp');
              showToast('TOTP MFA unenrolled successfully!', 'success');
              onUpdate();
            } finally {
              // Clean up listener
              this.privy.mfaPromises.off('mfaRequired', mfaListener);
            }
          } catch (error) {
            console.error('Unenroll TOTP MFA error:', error);
            showToast(error.message || 'Failed to unenroll TOTP MFA', 'error');
          }
        }
      },

      // Unenroll Passkey MFA
      {
        name: 'Unenroll Passkey MFA',
        function: async () => {
          if (!hasPasskey) {
            showToast('Passkey MFA is not enrolled', 'info');
            return;
          }

          if (!confirm('Are you sure you want to unenroll Passkey MFA? You will need to verify with MFA first.')) {
            return;
          }

          try {
            console.log('Starting Passkey MFA unenrollment...');
            showToast('Starting unenrollment...', 'info');

            // Set up MFA listener
            const mfaListener = async () => {
              console.log('MFA verification required');
              try {
                await mfaModal.handleVerification(this.privy, user);
              } catch (error) {
                console.error('MFA verification failed:', error);
                throw error;
              }
            };

            // Listen for MFA required event
            this.privy.mfaPromises.on('mfaRequired', mfaListener);

            try {
              // Attempt to unenroll by passing empty credential IDs
              await this.privy.mfa.submitEnrollMfa({ 
                method: 'passkey', 
                credentialIds: [],
                removeForLogin: false  // Keep passkey for login
              });
              showToast('Passkey MFA unenrolled successfully!', 'success');
              onUpdate();
            } finally {
              // Clean up listener
              this.privy.mfaPromises.off('mfaRequired', mfaListener);
            }
          } catch (error) {
            console.error('Unenroll Passkey MFA error:', error);
            showToast(error.message || 'Failed to unenroll Passkey MFA', 'error');
          }
        }
      }
    ];

    return createSection({
      name: 'MFA Enrollment',
      description: `Enroll in MFA to enhance security. Privy supports TOTP, SMS, and Passkey MFA methods. Once enrolled, you can use MFA to perform sensitive wallet actions. ${mfaStatus}`,
      filepath: 'src/sections/mfa.js',
      actions
    });
  }
}

