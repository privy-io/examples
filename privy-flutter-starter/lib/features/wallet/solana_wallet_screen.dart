import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:privy_flutter/privy_flutter.dart';

// Displays wallet details and provides actions for a Solana wallet.
class SolanaWalletScreen extends StatefulWidget {
  final EmbeddedSolanaWallet solanaWallet;

  const SolanaWalletScreen({super.key, required this.solanaWallet});

  @override
  State<SolanaWalletScreen> createState() => _SolanaWalletScreenState();
}

class _SolanaWalletScreenState extends State<SolanaWalletScreen> {
  // Controller for the message input TextField.
  final TextEditingController _messageController = TextEditingController();
  // Stores the latest signature generated.
  String? _latestSignature;

  // Updates the UI when the message input changes, to enable/disable the sign button.
  void _onMessageChanged() {
    setState(() {});
  }

  @override
  void initState() {
    super.initState();
    _messageController.addListener(_onMessageChanged);
  }

  @override
  void dispose() {
    _messageController.removeListener(_onMessageChanged);
    _messageController.dispose();
    super.dispose();
  }

  // Copies the latest signature to the clipboard and shows a SnackBar.
  void _copySignatureToClipboard() {
    if (_latestSignature != null && _latestSignature!.isNotEmpty) {
      Clipboard.setData(ClipboardData(text: _latestSignature!));
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Signature copied to clipboard!')),
      );
    }
  }

  // Signs the message entered by the user using the Solana wallet.
  Future<void> _signSolanaMessage() async {
    // solanaWallet is non-nullable from widget.solanaWallet
    final messageToSign = _messageController.text.trim();

    // Check if message is empty.
    if (messageToSign.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Please enter a message to sign."),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    // Solana's signMessage expects a Base64 encoded string.
    final String base64Message = base64Encode(utf8.encode(messageToSign));
    final result = await widget.solanaWallet.provider.signMessage(base64Message);

    // Handle the result (success or failure) from the signMessage call.
    result.fold(
      onSuccess: (signature) {
        setState(() {
          _latestSignature = signature;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("SOL Signature: $signature"),
            backgroundColor: Colors.green,
          ),
        );
      },
      onFailure: (error) {
        setState(() {
          _latestSignature = null;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Error signing SOL message: ${error.message}"),
            backgroundColor: Colors.red,
          ),
        );
      },
    );
  }

  @override
  // Builds the UI for the Solana Wallet screen.
  Widget build(BuildContext context) {
    const String walletType = 'Solana';
    final String address = widget.solanaWallet.address;
    final String? recoveryMethod = widget.solanaWallet.recoveryMethod;
    final int hdWalletIndex = widget.solanaWallet.hdWalletIndex;
    final String? chainId = widget.solanaWallet.chainId;

    return Scaffold(
      appBar: AppBar(
        title: Text('$walletType Wallet Details'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/profile'),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    const Icon(Icons.account_balance_wallet, size: 28),
                    const SizedBox(width: 12),
                    Text(
                      '$walletType Wallet',
                      style: Theme.of(context)
                          .textTheme
                          .headlineMedium
                          ?.copyWith(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                const Divider(),
                const SizedBox(height: 20),
                // Displays various details of the Solana wallet.
                _buildDetailItem(context, 'Address', address),
                if (chainId != null && chainId.isNotEmpty)
                  _buildDetailItem(context, 'Chain ID', chainId),
                if (recoveryMethod != null && recoveryMethod.isNotEmpty)
                  _buildDetailItem(context, 'Recovery Method', recoveryMethod),
                _buildDetailItem(
                  context,
                  'HD Wallet Index',
                  hdWalletIndex.toString(),
                ),
                const SizedBox(height: 24),
                TextField(
                  controller: _messageController,
                  decoration: const InputDecoration(
                    labelText: 'Message to Sign',
                    hintText: 'Enter the message here',
                    border: OutlineInputBorder(),
                  ),
                  minLines: 1,
                  maxLines: 3,
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    OutlinedButton.icon(
                      icon: const Icon(Icons.copy),
                      label: const Text('Copy Wallet Address'),
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: address));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Address copied to clipboard!'),
                          ),
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 12,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    ElevatedButton.icon(
                      icon: const Icon(Icons.edit),
                      label: const Text('Sign Message'),
                      onPressed: _messageController.text.trim().isEmpty
                          ? null
                          : _signSolanaMessage, // Solana specific signing method
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 12,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                // Displays the latest signature if available.
                if (_latestSignature != null)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Divider(),
                      const SizedBox(height: 16),
                      Text(
                        'Latest Signature:',
                        style: Theme.of(context)
                            .textTheme
                            .titleMedium
                            ?.copyWith(fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 8),
                      GestureDetector(
                        onTap: _copySignatureToClipboard,
                        child: Container(
                          padding: const EdgeInsets.all(12.0),
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            borderRadius: BorderRadius.circular(8.0),
                            border: Border.all(color: Colors.grey[300]!),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: SelectableText(
                                  _latestSignature!,
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                        fontFamily: 'monospace',
                                      ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Icon(
                                Icons.copy,
                                size: 18,
                                color: Colors.grey[600],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Helper widget to build a display item for wallet details (label and value).
  Widget _buildDetailItem(BuildContext context, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[700],
                ),
          ),
          const SizedBox(height: 4),
          SelectableText(value, style: Theme.of(context).textTheme.bodyLarge),
        ],
      ),
    );
  }
}
