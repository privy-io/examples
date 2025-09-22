const fs = require('fs');
const path = require('path');

/**
 * MOCK DATABASE IMPLEMENTATION
 * 
 * This starter repo uses a simple JSON file to mock a database for simplicity.
 * In a production environment, you should replace this with a proper database or other user management system.
 * 
 * This mock database stores the relationship between Telegram users and their Privy wallets.
 * The data structure is: { telegramUserId: privyWalletId }
 * This is a simple implementation for demonstration purposes only.
 */

// Define the path for the wallet mapping file
const walletMappingPath = path.join(__dirname, 'wallet-mappings.json');

/**
 * Retrieves all user-wallet relationships from the mock database
 * @returns {Object} Map of Telegram user IDs to Privy wallet IDs
 */
function getAllUserWallets() {
  try {
    if (fs.existsSync(walletMappingPath)) {
      const data = fs.readFileSync(walletMappingPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading user-wallet mappings:', error);
  }
  return {};
}

/**
 * Saves all user-wallet relationships to the mock database
 * @param {Object} userWallets - Map of Telegram user IDs to Privy wallet IDs
 */
function saveAllUserWallets(userWallets) {
  try {
    fs.writeFileSync(walletMappingPath, JSON.stringify(userWallets, null, 2));
  } catch (error) {
    console.error('Error saving user-wallet mappings:', error);
  }
}

/**
 * Saves a single user-wallet relationship to the mock database
 * This is more efficient than loading and saving the entire mapping when only updating one user
 * @param {string} userId - Telegram user ID
 * @param {string} walletId - Privy wallet ID
 */
function saveUserWallet(userId, walletId) {
  try {
    // Load existing mappings
    const userWallets = getAllUserWallets();
    
    // Update the specific user's wallet
    userWallets[userId] = walletId;
    
    // Save the updated mappings
    saveAllUserWallets(userWallets);
  } catch (error) {
    console.error(`Error saving wallet for user ${userId}:`, error);
  }
}

module.exports = {
  getAllUserWallets,
  saveAllUserWallets,
  saveUserWallet
}; 