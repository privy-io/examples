import 'package:flutter/material.dart';
import 'package:flutter_starter/core/privy_manager.dart';
import 'package:go_router/go_router.dart';
import 'package:privy_flutter/privy_flutter.dart';

import 'package:flutter_starter/features/authenticated/widgets/ethereum_wallets_widget.dart';
import 'package:flutter_starter/features/authenticated/widgets/linked_accounts_widget.dart';
import 'package:flutter_starter/features/authenticated/widgets/solana_wallets_widget.dart';
import 'package:flutter_starter/features/authenticated/widgets/user_profile_widget.dart';

class AuthenticatedScreen extends StatefulWidget {
  const AuthenticatedScreen({super.key});

  @override
  State<AuthenticatedScreen> createState() => _AuthenticatedScreenState();
}

class _AuthenticatedScreenState extends State<AuthenticatedScreen> {
  final _privyManager = privyManager;
  late PrivyUser _user;

  // Track loading states
  bool _isCreatingEthereumWallet = false;
  bool _isCreatingSolanaWallet = false;

  @override
  void initState() {
    super.initState();
    _fetchUser();
  }

  // Get the current authenticated user
  void _fetchUser() {
    _user = _privyManager.privy.user!;
  }

  // Show snackbar message
  void _showMessage(String message, {bool isError = false}) {
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : Colors.green,
      ),
    );
  }

  // Create Ethereum wallet
  Future<void> _createEthereumWallet() async {

    setState(() {
      _isCreatingEthereumWallet = true;
    });

    try {
      final result = await _user.createEthereumWallet(allowAdditional: true);

      result.fold(
        onSuccess: (wallet) {
          _showMessage("Ethereum wallet created: ${wallet.address}");
          // Refresh user to update the wallet list
          setState(() {
            _isCreatingEthereumWallet = false;
          });
        },
        onFailure: (error) {
          setState(() {
            _isCreatingEthereumWallet = false;
          });
          _showMessage(
            "Error creating wallet: ${error.message}",
            isError: true,
          );
        },
      );
    } catch (e) {
      setState(() {
        _isCreatingEthereumWallet = false;
      });
      _showMessage("Unexpected error: $e", isError: true);
    }
  }

  // Create Solana wallet
  Future<void> _createSolanaWallet() async {
    
    setState(() {
      _isCreatingSolanaWallet = true;
    });

    try {
      final result = await _user.createSolanaWallet();

      result.fold(
        onSuccess: (wallet) {
          _showMessage("Solana wallet created: ${wallet.address}");
          // Refresh user to update the wallet list
          setState(() {
            _isCreatingSolanaWallet = false;
          });
        },
        onFailure: (error) {
          setState(() {
            _isCreatingSolanaWallet = false;
          });
          _showMessage(
            "Error creating wallet: ${error.message}",
            isError: true,
          );
        },
      );
    } catch (e) {
      setState(() {
        _isCreatingSolanaWallet = false;
      });
      _showMessage("Unexpected error: $e", isError: true);
    }
  }

  // Logout
  Future<void> _logout() async {
    try {
      await _privyManager.privy.logout();

      if (mounted) {
        // Navigate back to home after logout
        context.go('/');
      }
    } catch (e) {
      _showMessage("Logout error: $e", isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // User Profile Information
              UserProfileWidget(user: _user),
              const Divider(),
              const SizedBox(height: 16),

              // Linked Accounts
              LinkedAccountsWidget(user: _user),

              const SizedBox(height: 16),

              // Ethereum Wallets (Navigation handled inside widget)
              EthereumWalletsWidget(user: _user),

              const SizedBox(height: 24),

              // Solana Wallets (Navigation handled inside widget)
              SolanaWalletsWidget(user: _user),
            ],
          ),
        ),
      ),
      floatingActionButton: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // Ethereum wallet creation button
          FloatingActionButton.extended(
            heroTag: "createEthereum",
            onPressed:
                (_isCreatingEthereumWallet || _isCreatingSolanaWallet)
                    ? null
                    : _createEthereumWallet,
            icon:
                _isCreatingEthereumWallet
                    ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                    : null,
            label: const Text('Create ETH Wallet'),
            backgroundColor:
                (_isCreatingEthereumWallet || _isCreatingSolanaWallet)
                    ? Colors.grey
                    : null,
          ),
          const SizedBox(height: 8),
          // Solana wallet creation button
          FloatingActionButton.extended(
            heroTag: "createSolana",
            onPressed:
                (_isCreatingSolanaWallet || _isCreatingEthereumWallet)
                    ? null
                    : _createSolanaWallet,
            icon:
                _isCreatingSolanaWallet
                    ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                    : null,
            label: const Text('Create SOL Wallet'),
            backgroundColor:
                (_isCreatingSolanaWallet || _isCreatingEthereumWallet)
                    ? Colors.grey
                    : null,
          ),
          const SizedBox(height: 8),
          FloatingActionButton.extended(
            heroTag: "logout",
            onPressed: _logout,
            icon: const Icon(Icons.logout),
            label: const Text('Logout'),
            backgroundColor: Colors.redAccent,
          ),
        ],
      ),
    );
  }
}
