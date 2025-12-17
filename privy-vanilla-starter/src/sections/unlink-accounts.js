import { createSection } from '../utils/section-builder.js';
import { showToast } from '../utils/toast.js';

/**
 * Unlink Accounts Section
 * Allows users to unlink various account types (email, phone, OAuth, wallets)
 */
export class UnlinkAccounts {
  constructor(privyClient) {
    this.privy = privyClient;
    this.setupUnlinkModal();
  }

  /**
   * Setup unlink modal
   */
  setupUnlinkModal() {
    // Check if modal already exists
    if (document.getElementById('unlink-modal')) return;

    // Create modal HTML
    const modalHTML = `
      <div id="unlink-modal" class="modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="unlink-modal-title">Unlink Account</h3>
            <button id="unlink-modal-close" class="close-button">&times;</button>
          </div>
          <div id="unlink-modal-body" class="modal-body"></div>
          <div id="unlink-modal-error" class="error-message hidden"></div>
        </div>
      </div>
    `;

    // Append to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Setup close handlers
    const modal = document.getElementById('unlink-modal');
    const closeBtn = document.getElementById('unlink-modal-close');
    
    closeBtn.addEventListener('click', () => this.closeUnlinkModal());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeUnlinkModal();
    });
  }

  /**
   * Open unlink modal
   */
  openUnlinkModal(title, bodyHTML) {
    const modal = document.getElementById('unlink-modal');
    const modalTitle = document.getElementById('unlink-modal-title');
    const modalBody = document.getElementById('unlink-modal-body');
    const errorDisplay = document.getElementById('unlink-modal-error');

    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHTML;
    errorDisplay.classList.add('hidden');
    modal.classList.remove('hidden');
  }

  /**
   * Close unlink modal
   */
  closeUnlinkModal() {
    const modal = document.getElementById('unlink-modal');
    modal.classList.add('hidden');
  }

  /**
   * Show error in unlink modal
   */
  showUnlinkError(message) {
    const errorDisplay = document.getElementById('unlink-modal-error');
    errorDisplay.textContent = message;
    errorDisplay.classList.remove('hidden');
  }

  render(user, onUpdate) {
    const actions = [];

    // Debug: Log user structure
    console.log('Unlink Accounts - User object:', user);
    console.log('Unlink Accounts - linked_accounts:', user.linked_accounts);

    // Handle both linked_accounts array and individual account properties
    const linkedAccounts = user.linked_accounts || [];
    
    // Unlink Email
    const emails = linkedAccounts.filter(a => a.type === 'email');
    console.log('Found emails:', emails);
    
    emails.forEach(email => {
      actions.push({
        name: `Unlink Email (${email.address})`,
        function: () => {
          this.openUnlinkModal('Unlink Email', `
            <p style="margin-bottom: 1rem; color: #6b7280;">Are you sure you want to unlink <strong>${email.address}</strong>?</p>
            <div style="display: flex; gap: 0.5rem;">
              <button id="unlink-email-confirm-btn" class="button-primary" style="flex: 1;">Yes, Unlink</button>
              <button id="unlink-email-cancel-btn" class="button-outline" style="flex: 1;">Cancel</button>
            </div>
          `);

          setTimeout(() => {
            const confirmBtn = document.getElementById('unlink-email-confirm-btn');
            const cancelBtn = document.getElementById('unlink-email-cancel-btn');

            confirmBtn.addEventListener('click', async () => {
              confirmBtn.disabled = true;
              confirmBtn.textContent = 'Unlinking...';

              try {
                await this.privy.auth.email.unlink(email.address);
                showToast('Email unlinked successfully', 'success');
                this.closeUnlinkModal();
                onUpdate();
              } catch (error) {
                console.error('Unlink email error:', error);
                this.showUnlinkError(error.message || 'Failed to unlink email');
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Yes, Unlink';
              }
            });

            cancelBtn.addEventListener('click', () => this.closeUnlinkModal());
          }, 100);
        }
      });
    });

    // Unlink Phone
    const phones = linkedAccounts.filter(a => a.type === 'phone');
    console.log('Found phones:', phones);
    
    phones.forEach(phone => {
      actions.push({
        name: `Unlink Phone (${phone.phoneNumber})`,
        function: () => {
          this.openUnlinkModal('Unlink Phone', `
            <p style="margin-bottom: 1rem; color: #6b7280;">Are you sure you want to unlink <strong>${phone.phoneNumber}</strong>?</p>
            <div style="display: flex; gap: 0.5rem;">
              <button id="unlink-phone-confirm-btn" class="button-primary" style="flex: 1;">Yes, Unlink</button>
              <button id="unlink-phone-cancel-btn" class="button-outline" style="flex: 1;">Cancel</button>
            </div>
          `);

          setTimeout(() => {
            const confirmBtn = document.getElementById('unlink-phone-confirm-btn');
            const cancelBtn = document.getElementById('unlink-phone-cancel-btn');

            confirmBtn.addEventListener('click', async () => {
              confirmBtn.disabled = true;
              confirmBtn.textContent = 'Unlinking...';

              try {
                await this.privy.auth.phone.unlink(phone.phoneNumber);
                showToast('Phone unlinked successfully', 'success');
                this.closeUnlinkModal();
                onUpdate();
              } catch (error) {
                console.error('Unlink phone error:', error);
                this.showUnlinkError(error.message || 'Failed to unlink phone');
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Yes, Unlink';
              }
            });

            cancelBtn.addEventListener('click', () => this.closeUnlinkModal());
          }, 100);
        }
      });
    });

    // Unlink OAuth - Create separate button for each OAuth provider
    const oauthAccounts = linkedAccounts.filter(a => 
      a.type.endsWith('_oauth')
    );
    console.log('Found OAuth accounts:', oauthAccounts);

    oauthAccounts.forEach(account => {
      // Remove '_oauth' suffix and capitalize
      const providerName = account.type.replace('_oauth', '');
      const displayName = providerName.charAt(0).toUpperCase() + providerName.slice(1);
      const identifier = account.email || account.username || account.name || account.subject;
      
      actions.push({
        name: `Unlink ${displayName}`,
        function: () => {
          this.openUnlinkModal(`Unlink ${displayName}`, `
            <p style="margin-bottom: 1rem; color: #6b7280;">Are you sure you want to unlink your <strong>${displayName}</strong> account${identifier ? ` (${identifier})` : ''}?</p>
            <div style="display: flex; gap: 0.5rem;">
              <button id="unlink-oauth-confirm-btn" class="button-primary" style="flex: 1;">Yes, Unlink</button>
              <button id="unlink-oauth-cancel-btn" class="button-outline" style="flex: 1;">Cancel</button>
            </div>
          `);

          setTimeout(() => {
            const confirmBtn = document.getElementById('unlink-oauth-confirm-btn');
            const cancelBtn = document.getElementById('unlink-oauth-cancel-btn');

            confirmBtn.addEventListener('click', async () => {
              confirmBtn.disabled = true;
              confirmBtn.textContent = 'Unlinking...';

              try {
                await this.privy.auth.oauth.unlink(providerName, account.subject);
                showToast(`${displayName} account unlinked successfully`, 'success');
                this.closeUnlinkModal();
                onUpdate();
              } catch (error) {
                console.error('Unlink OAuth error:', error);
                this.showUnlinkError(error.message || 'Failed to unlink OAuth account');
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Yes, Unlink';
              }
            });

            cancelBtn.addEventListener('click', () => this.closeUnlinkModal());
          }, 100);
        }
      });
    });

    const linkedAccountsCount = linkedAccounts.length;
    console.log('Total actions created:', actions.length);
    
    const description = `Remove linked accounts from your profile. Currently linked: ${linkedAccountsCount} account(s)`;

    return createSection({
      name: 'Unlink Accounts',
      description,
      filepath: 'src/sections/unlink-accounts.js',
      actions
    });
  }
}

