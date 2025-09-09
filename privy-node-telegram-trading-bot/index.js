require('dotenv').config({ path: '.env.local' });
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { PrivyClient } = require('@privy-io/server-auth');
const { PublicKey, VersionedTransaction } = require('@solana/web3.js');
const { getAllUserWallets, saveUserWallet } = require('./mockDb');
const { getJupiterUltraOrder, executeJupiterUltraOrder, getJupiterUltraBalances, SOL_MINT } = require('./jupiter');

const app = express();
const port = process.env.PORT || 3001;

// Initialize Privy client
const privy = new PrivyClient(process.env.PRIVY_APP_ID, process.env.PRIVY_APP_SECRET, {
  walletApi: {
    authorizationPrivateKey: process.env.PRIVY_AUTHORIZATION_PRIVATE_KEY
  }
});

// Initialize Telegram bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Middleware to parse JSON
app.use(express.json());

// Basic route to verify server is running
app.get('/', (req, res) => {
  res.send('Telegram Bot Server is running!');
});

/**
 * MOCK DATABASE IMPLEMENTATION
 * 
 * This starter repo uses a simple JSON file to mock a database for simplicity.
 * In a production environment, you should replace this with a proper database.
 * 
 * Options for production:
 * - MongoDB
 * - PostgreSQL
 * - Redis
 * - etc.
 * 
 * The wallet mappings are stored in a JSON file that maps Telegram user IDs to Privy wallet IDs.
 * This is a simple implementation for demonstration purposes only.
 */

/**
 * Handles the /start command to create or retrieve a user's wallet
 * This command:
 * 1. Checks if user already has a wallet
 * 2. Creates a new wallet if needed
 * 3. Saves the user-wallet relationship to our mock database
 * 4. Returns the wallet address to the user
 * 
 * @param {Object} msg - Telegram message object
 * @param {Object} msg.from - User information
 * @param {number} msg.from.id - Unique Telegram user ID
 * @param {Object} msg.chat - Chat information
 * @param {number} msg.chat.id - Chat ID to send responses to
 */
bot.onText(/\/start/, async (msg) => {
  const userId = msg.from.id;
  let walletId;
  let walletAddress;
  
  console.log(`Processing /start command for user ${userId}`);
  
  // Load existing user-wallet relationships from our mock database
  // In production, you would query your actual database here
  const userWallets = getAllUserWallets();
  
  if (userWallets[userId]) {
    console.log(`User ${userId} already has a wallet. Using existing wallet.`);
    walletId = userWallets[userId];
  } else {
    console.log(`User ${userId} does not have a wallet. Creating new wallet.`);
    try {
      // Create a new Solana wallet using Privy's API
      const {id, address, chainType} = await privy.walletApi.createWallet({chainType: 'solana'});
      walletId = id;
      walletAddress = address;
      
      // Save the new user-wallet relationship to our mock database
      // In production, you would insert this into your actual database
      saveUserWallet(userId, walletId);
      
      console.log(`Successfully created wallet for user ${userId}: ${walletAddress}`);
    } catch (error) {
      console.error(`Error creating wallet for user ${userId}:`, error);
      return bot.sendMessage(
        msg.chat.id,
        '❌ Sorry, there was an error creating your wallet. Please try again later.\n\n' +
        'If this error persists, please contact support.'
      );
    }
  }
  
  try {
    // If we don't have the wallet address yet, fetch it
    if (!walletAddress) {
      const wallet = await privy.walletApi.getWallet({id: walletId});
      walletAddress = wallet.address;
    }
    
    // Send welcome message with wallet address
    bot.sendMessage(
      msg.chat.id,
      `👋 Welcome to the Solana Trading Bot!\n\n` +
      `Your wallet address is: ${walletAddress}\n\n` +
      `You can use the following commands:\n` +
      `/getwallet - View your wallet balance\n` +
      `/swap <token_address> <amount> - Swap SOL for another token\n\n` +
      `Example: /swap EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v 0.1`
    );
  } catch (error) {
    console.error(`Error fetching wallet for user ${userId}:`, error);
    bot.sendMessage(
      msg.chat.id,
      '❌ Sorry, there was an error accessing your wallet. Please try again later.\n\n' +
      'If this error persists, please contact support.'
    );
  }
});

/**
 * Handles the /getwallet command to display a user's wallet address and balances
 * This command:
 * 1. Retrieves the user's wallet from our mock database
 * 2. Fetches current token balances
 * 3. Formats and displays the information
 * 
 * @param {Object} msg - Telegram message object
 */
bot.onText(/\/getwallet/, async (msg) => {
  const userId = msg.from.id;
  console.log(`Processing /getwallet command for user ${userId}`);
  
  // Load user-wallet relationships from our mock database
  // In production, you would query your actual database here
  const userWallets = getAllUserWallets();
  
  if (!userWallets[userId]) {
    return bot.sendMessage(
      msg.chat.id,
      '❌ You don\'t have a wallet yet. Use /start to create one.'
    );
  }

  try {
    // Get the user's wallet
    const walletId = userWallets[userId];
    const wallet = await privy.walletApi.getWallet({id: walletId});
    const walletAddress = wallet.address;
    
    console.log(`Fetching balances for wallet ${walletAddress}`);
    
    // Get current token balances using Jupiter Ultra API
    const balances = await getJupiterUltraBalances(walletAddress);
    
    // Format the balance message
    let balanceMessage = `💰 Wallet Balance:\n\n`;
    let hasBalance = false;
    
    for (const [token, balance] of Object.entries(balances)) {
      if (balance.amount !== "0") {
        hasBalance = true;
        balanceMessage += `${token}: ${balance.uiAmount.toFixed(4)}\n`;
      }
    }
    
    if (!hasBalance) {
      balanceMessage += "No tokens found in wallet\n";
    }
    
    // Send the wallet information to the user
    bot.sendMessage(
      msg.chat.id,
      `Your wallet address is: ${walletAddress}\n\n` +
      balanceMessage +
      `\nUse /swap <token_address> <amount> to swap SOL for another token`
    );
  } catch (error) {
    console.error(`Error fetching wallet for user ${userId}:`, error);
    bot.sendMessage(
      msg.chat.id,
      '❌ Sorry, there was an error accessing your wallet. Please try again later.\n\n' +
      'If this error persists, please contact support.'
    );
  }
});

/**
 * Handles the /swap command to swap SOL for another token
 * This command:
 * 1. Validates the input parameters
 * 2. Checks user's SOL balance
 * 3. Creates and executes the swap
 * 4. Returns transaction details
 * 
 * @param {Object} msg - Telegram message object
 * @param {Array} match - Regex match groups
 */
bot.onText(/\/swap (.+) (.+)/, async (msg, match) => {
  const userId = msg.from.id;
  const tokenMint = match[1]; // First capture group is token address
  const amount = parseFloat(match[2]); // Second capture group is amount

  console.log(`Processing /swap command for user ${userId}: ${amount} SOL for token ${tokenMint}`);

  // Load user-wallet relationships from our mock database
  // In production, you would query your actual database here
  const userWallets = getAllUserWallets();

  if (!userWallets[userId]) {
    return bot.sendMessage(
      msg.chat.id,
      '❌ Please use /start first to create a wallet.'
    );
  }

  // Validate token address
  try {
    new PublicKey(tokenMint);
  } catch (error) {
    return bot.sendMessage(
      msg.chat.id,
      '❌ Invalid token address. Please enter a valid Solana token address.\n\n' +
      'Example:\n' +
      '/swap EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v 0.1'
    );
  }

  // Validate amount
  if (isNaN(amount) || amount <= 0) {
    return bot.sendMessage(
      msg.chat.id,
      '❌ Please enter a valid amount of SOL (e.g., 0.1, 0.5, 1.0)\n\n' +
      'Example:\n' +
      '/swap EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v 0.1'
    );
  }

  try {
    // Get user's wallet
    const walletId = userWallets[userId];
    const wallet = await privy.walletApi.getWallet({id: walletId});
    const walletAddress = wallet.address;

    // Check SOL balance
    const balances = await getJupiterUltraBalances(walletAddress);
    const solBalance = balances.SOL?.uiAmount || 0;

    if (solBalance < amount) {
      return bot.sendMessage(
        msg.chat.id,
        `❌ Insufficient SOL balance.\n` +
        `You have ${solBalance.toFixed(4)} SOL but need ${amount} SOL for this swap.\n` +
        `Please try again with a smaller amount.`
      );
    }

    // Create the swap order
    const lamports = Math.floor(amount * 1e9); // Convert SOL to lamports
    console.log(`Creating swap order for ${amount} SOL to token ${tokenMint}`);
    
    const order = await getJupiterUltraOrder({
      inputMint: SOL_MINT,
      outputMint: tokenMint,
      amount: lamports.toString(),
      taker: walletAddress
    });

    // Sign the transaction
    console.log('Signing transaction...');
    const transaction = VersionedTransaction.deserialize(Buffer.from(order.transaction, 'base64'));
    const {signedTransaction} = await privy.walletApi.solana.signTransaction({
      walletId,
      transaction: transaction
    });

    bot.sendMessage(msg.chat.id, '🔄 Transaction signed. Processing swap...');

    // Execute the swap
    console.log('Executing swap...');
    const executeResult = await executeJupiterUltraOrder(
      Buffer.from(signedTransaction.serialize()).toString('base64'),
      order.requestId
    );

    console.log(`Swap successful! Transaction: ${executeResult.signature}`);

    // Send success message
    bot.sendMessage(
      msg.chat.id,
      `✅ Swap successful!\n\n` +
      `Transaction: https://solscan.io/tx/${executeResult.signature}\n` +
      `You swapped ${amount} SOL for approximately ${order.outAmount / 1e9} tokens\n\n` +
      `Use /getwallet to check your new balance`
    );

  } catch (error) {
    console.error('Error in buy flow:', error);
    
    // Handle specific error cases
    if (error.message.includes('0x1771')) {
      bot.sendMessage(
        msg.chat.id,
        '❌ Swap failed due to price movement. Please try again with a smaller amount or wait a moment.'
      );
    } else if (error.response?.data?.error) {
      bot.sendMessage(
        msg.chat.id,
        `❌ Error: ${error.response.data.error}\n\n` +
        'Please try again with /swap <token_address> <amount>'
      );
    } else {
      bot.sendMessage(
        msg.chat.id,
        '❌ Sorry, there was an error processing your swap. Please try again later.\n\n' +
        'If this error persists, please contact support.'
      );
    }
  }
});

/**
 * Handles the /swap command with no parameters
 * This command:
 * 1. Detects when a user sends just /swap without parameters
 * 2. Responds with instructions on how to use the command properly
 * 
 * @param {Object} msg - Telegram message object
 */
bot.onText(/^\/swap$/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    '❌ Missing parameters. You must provide both token address and amount.\n\n' +
    'Correct usage:\n' +
    '/swap <token_address> <amount>\n\n' +
    'Example:\n' +
    '/swap EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v 0.1'
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 