import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:privy_flutter/privy_flutter.dart';
import 'package:convert/convert.dart'; // For hex encoding

class EthWalletScreen extends StatefulWidget {
  final EmbeddedEthereumWallet ethereumWallet;

  const EthWalletScreen({super.key, required this.ethereumWallet});

  @override
  State<EthWalletScreen> createState() => _EthWalletScreenState();
}

class _EthWalletScreenState extends State<EthWalletScreen> {
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

  // Signs the message entered by the user using the Ethereum wallet.
  Future<void> _signEthereumMessage() async {
    // ethereumWallet is non-nullable from widget.ethereumWallet
    final messageToSign = _messageController.text.trim();

    // Check if message is empty
    if (messageToSign.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Please enter a message to sign."),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    // Convert the user's message to a hex-encoded Utf8 representation for Ethereum.
    final messageBytes = utf8.encode(messageToSign);
    final String hexMessage = '0x${hex.encode(messageBytes)}';

    final rpcRequest = EthereumRpcRequest(
      method: "personal_sign",
      params: [hexMessage, widget.ethereumWallet.address],
    );

    final result = await widget.ethereumWallet.provider.request(rpcRequest);

    // Handle the result (success or failure) from the signMessage call.
    result.fold(
      onSuccess: (response) {
        final signature = response.data.toString();
        setState(() {
          _latestSignature = signature;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("ETH Signature: $signature"),
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
            content: Text("Error signing ETH message: ${error.message}"),
            backgroundColor: Colors.red,
          ),
        );
      },
    );
  }

  @override
  // Builds the UI for the Ethereum Wallet screen.
  Widget build(BuildContext context) {
    const String walletType = 'Ethereum';
    final String address = widget.ethereumWallet.address;
    final String? recoveryMethod = widget.ethereumWallet.recoveryMethod;
    final int hdWalletIndex = widget.ethereumWallet.hdWalletIndex;
    final String? chainId = widget.ethereumWallet.chainId;

    return Scaffold(
      appBar: AppBar(
        title: Text('$walletType Wallet Details'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed:
              () => context.canPop() ? context.pop() : context.go('/profile'),
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
                      style: Theme.of(context).textTheme.headlineMedium
                          ?.copyWith(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                const Divider(),
                const SizedBox(height: 20),
                // Displays various details of the Ethereum wallet.
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
                  minLines:
                      1, // Adjusted from original for consistency if needed, original was 1
                  maxLines:
                      3, // Adjusted from original for consistency if needed, original was 3
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
                      onPressed:
                          _messageController.text.trim().isEmpty
                              ? null
                              : _signEthereumMessage, // Ethereum specific signing method
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
                        style: Theme.of(context).textTheme.titleMedium
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
                                  style: Theme.of(context).textTheme.bodyMedium
                                      ?.copyWith(fontFamily: 'monospace'),
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
