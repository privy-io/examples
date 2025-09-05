# 🧪 PrivySDK Flutter Starter App

This is a minimal Flutter starter app demonstrating the base functionality of the [PrivySDK](https://docs.privy.io/basics/flutter/quickstart) for authentication and user management.

## 🚀 Features

- PrivySDK setup and initialization
- Basic email authentication flow
- Cross-platform support (iOS & Android)
- Wallet creation (Solana and Ethereum)
- Signing messages with the wallets


## 🛠 Getting Started

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/privy-io/flutter-starter.git
    cd privy_flutter_starter
    ```

2.  **Set up your environment variables:**
    This project uses a `.env` file to manage your Privy App ID and Client ID.
    Create a file named `.env` in the root of the `privy_flutter_starter` directory and add your Privy credentials like this:
    ```env
    PRIVY_APP_ID=YOUR_PRIVY_APP_ID
    PRIVY_CLIENT_ID=YOUR_PRIVY_CLIENT_ID
    ```
    Replace `YOUR_PRIVY_APP_ID` and `YOUR_PRIVY_CLIENT_ID` with your actual credentials from the [Privy Dashboard](https://dashboard.privy.io).

3.  **Run the app:**
    ```bash
    flutter run
    ```

4.  **Have fun building with Privy!** 🎉
