const axios = require('axios');

// Constants for Jupiter swap
const JUPITER_ULTRA_API_URL = 'https://lite-api.jup.ag/ultra/v1';
const SOL_MINT = 'So11111111111111111111111111111111111111112';

/**
 * Gets a Jupiter Ultra swap order
 * @param {Object} params - The parameters for the order
 * @param {string} params.inputMint - The mint address of the input token
 * @param {string} params.outputMint - The mint address of the output token
 * @param {string} params.amount - The amount to swap in lamports/smallest denomination
 * @param {string} params.taker - The wallet address that will execute the swap
 * @returns {Promise<Object>} The order details including transaction and requestId
 */
async function getJupiterUltraOrder({inputMint, outputMint, amount, taker}) {
  try {
    const response = await axios({
      method: 'get',
      maxBodyLength: Infinity,
      url: `${JUPITER_ULTRA_API_URL}/order`,
      params: {
        inputMint,
        outputMint,
        amount,
        taker,
        slippageBps: 200 // 2% slippage tolerance
      },
      headers: {
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting Jupiter Ultra order:', error);
    throw error;
  }
}

/**
 * Executes a Jupiter Ultra swap order
 * @param {string} signedTransaction - Base64 encoded signed transaction
 * @param {string} requestId - The request ID from the order
 * @returns {Promise<Object>} The execution result including transaction signature
 */
async function executeJupiterUltraOrder(signedTransaction, requestId) {
  try {
    const response = await axios({
      method: 'post',
      maxBodyLength: Infinity,
      url: `${JUPITER_ULTRA_API_URL}/execute`,
      data: {
        signedTransaction,
        requestId
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error executing Jupiter Ultra order:', error);
    throw error;
  }
}

/**
 * Gets token balances for a wallet using Jupiter Ultra API
 * @param {string} walletAddress - The wallet address to check balances for
 * @returns {Promise<Object>} The balances for all tokens in the wallet
 */
async function getJupiterUltraBalances(walletAddress) {
  try {
    const response = await axios({
      method: 'get',
      maxBodyLength: Infinity,
      url: `${JUPITER_ULTRA_API_URL}/balances/${walletAddress}`,
      headers: {
        'Accept': 'application/json'
      }
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting Jupiter Ultra balances:', error);
    throw error;
  }
}

module.exports = {
  getJupiterUltraOrder,
  executeJupiterUltraOrder,
  getJupiterUltraBalances,
  SOL_MINT
}; 