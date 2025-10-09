# Telegram trading bot starter

A Telegram trading bot with Privy authentication, built for Solana trading using Jupiter.

For a detailed guide on implementing this starter repo, visit [here](https://docs.privy.io/recipes/react/telegram-trading-guide)

## Features

- Telegram bot interface for trading commands
- Solana trading capabilities via Jupiter
- Wallet management and token operations

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Privy API credentials

## Installation

1. Clone the repository:

```bash
mkdir -p privy-node-telegram-trading-bot && curl -L https://github.com/privy-io/privy-examples/archive/main.tar.gz | tar -xz --strip=3 -C privy-node-telegram-trading-bot examples-main/examples/privy-node-telegram-trading-bot && cd privy-node-telegram-trading-bot
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Copy the example environment file
cp .env.example .env.local
```

4. Edit `.env.local` with your credentials:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
```

## Database

This starter kit includes a mock database implementation for demonstration purposes. It's a simple in-memory database that doesn't require any setup. However, for production use, you should implement your own database solution (e.g., PostgreSQL, MongoDB, etc.) to handle user data, wallet mappings, and trading history.

## Usage

Start the bot:

```bash
npm start
```

## Available Commands

- `/start` - Initialize the bot
- `/getwallet` - Check wallet balance
- `/swap <TOKEN_ADDRESS> <AMOUNT OF SOL>` - Swap SOL for <TOKEN_ADDRESS>

## Check out:

- `index.js` for core Telegram bot operations and Privy wallet interactions
- `jupiter.js` for Juptiter API related functions
- `mockDb.js` for our mocked DB code.
