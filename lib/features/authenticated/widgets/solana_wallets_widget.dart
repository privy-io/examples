import 'package:flutter/material.dart';
import 'package:flutter_starter/router/app_router.dart';
import 'package:go_router/go_router.dart';
import 'package:privy_flutter/privy_flutter.dart';

/// Widget that displays all Solana wallets for a Privy user
class SolanaWalletsWidget extends StatelessWidget {
  final PrivyUser user;

  const SolanaWalletsWidget({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("Solana Wallets", style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 10),
        if (user.embeddedSolanaWallets.isEmpty)
          const Text("No Solana wallets", style: TextStyle(color: Colors.grey))
        else
          ...user.embeddedSolanaWallets.map(
            (wallet) => _buildWalletTile(context, wallet),
          ),
      ],
    );
  }

  Widget _buildWalletTile(BuildContext context, EmbeddedSolanaWallet wallet) {
    // Wrap in InkWell for navigation
    return InkWell(
      onTap: () {
        // Navigate to the wallet detail screen, passing the wallet object
        GoRouter.of(context).pushNamed(
          AppRouter.solanaWalletRoute, // Updated to use solanaWalletRoute
          extra: wallet, // Pass the specific wallet
        );
      },
      child: Card(
        margin: const EdgeInsets.only(bottom: 8),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.account_balance_wallet),
                  const SizedBox(width: 8),
                  Text(
                    "Solana Wallet",
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                "Address: ${_formatAddress(wallet.address)}",
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              if (wallet.chainId != null)
                Text(
                  "Chain ID: ${wallet.chainId}",
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey),
                ),
              if (wallet.recoveryMethod != null)
                Text(
                  "Recovery Method: ${wallet.recoveryMethod}",
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey),
                ),
              Text(
                "HD Wallet Index: ${wallet.hdWalletIndex}",
                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatAddress(String address) {
    if (address.length > 14) {
      return '${address.substring(0, 6)}...${address.substring(address.length - 8)}';
    }
    return address;
  }
}
