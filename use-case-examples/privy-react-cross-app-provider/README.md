# Cross-app provider demo

A comprehensive demo application showcasing the `@privy-io/cross-app-provider` SDK utilities for implementing secure cross-app wallet connections and transactions.

## 🎯 Purpose

This demo app provides interactive examples of all the key utilities in the `@privy-io/cross-app-provider` SDK, helping developers understand how to implement cross-app functionality in their own applications.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file:

   ```bash
   # Privy Configuration
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open the demo:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Demo Pages

### 🔗 Connection flow (`/connect`)

Demonstrates the complete cross-app connection workflow:

- **URL Parameter Parsing**: Using `getConnectionRequestFromUrlParams()` to extract connection details
- **Connection Acceptance**: Using `acceptConnection()` to establish secure wallet connections
- **Connection Rejection**: Using `rejectConnection()` to decline connections
- **Error Handling**: Using `handleError()` to communicate failures back to requesting apps
- **Wallet Creation**: Automatic embedded wallet creation for users without wallets

**Key SDK Functions:**

- `getConnectionRequestFromUrlParams()` - Parse requester_public_key and requester_origin from URL
- `acceptConnection()` - Accept cross-app connections with encrypted responses
- `rejectConnection()` - Reject connection requests
- `handleError()` - Send error responses to requester apps

### ⚡ Transaction flow (`/transact`)

Shows how to handle transaction requests and message signing:

- **Request Verification**: Using `getVerifiedTransactionRequest()` to load and decrypt transaction requests
- **Message Signing**: Integration with Privy's `useSignMessage` hook
- **Success Responses**: Using `handleRequestResult()` to send signed results back to requesters
- **Transaction Rejection**: Using `rejectRequest()` to decline transaction requests
- **Comprehensive Error Handling**: Using `handleError()` for various failure scenarios

**Key SDK Functions:**

- `getVerifiedTransactionRequest()` - Parse, decrypt, and verify transaction requests from URL parameters
- `handleRequestResult()` - Send encrypted success responses (signatures) back to requester
- `rejectRequest()` - Send rejection responses for transaction requests
- `handleError()` - Handle and communicate transaction errors
