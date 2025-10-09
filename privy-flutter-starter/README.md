# Privy + Flutter Starter

This example showcases how to get started using Privy's Flutter SDK inside a Flutter application.

## Getting Started

### 1. Clone the Project

```bash
mkdir -p privy-flutter-starter && curl -L https://github.com/privy-io/privy-examples/archive/main.tar.gz | tar -xz --strip=2 -C privy-flutter-starter examples-main/privy-flutter-starter && cd privy-flutter-starter
```

### 2. Install Dependencies

```bash
flutter pub get
```

### 3. Configure Environment

Create a `.env` file in the root directory and configure your Privy app credentials:

```bash
touch .env
```

Update `.env` with your Privy app credentials:

```env
PRIVY_APP_ID=your_app_id_here
PRIVY_CLIENT_ID=your_client_id_here
```

**Important:** Get your credentials from the [Privy Dashboard](https://dashboard.privy.io).

### 4. Start Development Server

```bash
flutter run
```

This will launch the app on your connected device or emulator.

## Core Functionality

### 1. Login with Privy

Login or sign up using Privy's authentication flow for Flutter.

[`lib/main.dart`](./lib/main.dart)

```dart
import 'package:privy_flutter/privy_flutter.dart';

final privy = PrivyManager().privy;
// Authentication handled through Privy's Flutter screens
```

### 2. Create Multi-Chain Wallets

Programmatically create embedded wallets for Ethereum and Solana.

[`lib/features/authenticated/widgets/ethereum_wallets_widget.dart`](./lib/features/authenticated/widgets/ethereum_wallets_widget.dart)

```dart
import 'package:privy_flutter/privy_flutter.dart';

// Create Ethereum wallet
await privy.createEthereumWallet();

// Create Solana wallet
await privy.createSolanaWallet();
```

### 3. Send Transactions

Send transactions on Ethereum using Flutter SDK's RPC methods.

[`lib/features/wallet/eth_wallet_screen.dart`](./lib/features/wallet/eth_wallet_screen.dart)

```dart
import 'package:privy_flutter/privy_flutter.dart';

final request = EthereumRpcRequest.ethSendTransaction(
  jsonEncode({
    "from": wallet.address,
    "to": toAddress,
    "value": weiHex,
    "chainId": "0xAA36A7",
  }),
);
final result = await wallet.provider.request(request);
```

## Relevant Links

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [Flutter SDK](https://www.npmjs.com/package/privy_flutter)
- [Flutter Documentation](https://flutter.dev/docs)
