import 'package:flutter/material.dart';
import 'package:flutter_starter/core/privy_manager.dart';
import 'package:flutter_starter/router/app_router.dart';
import 'package:go_router/go_router.dart';
import 'package:privy_flutter/privy_flutter.dart';

class OAuthAuthenticationScreen extends StatefulWidget {
  const OAuthAuthenticationScreen({super.key});

  @override
  OAuthAuthenticationScreenState createState() =>
      OAuthAuthenticationScreenState();
}

class OAuthAuthenticationScreenState extends State<OAuthAuthenticationScreen> {
  bool _isLoading = false;
  String? _errorMessage;

  /// Shows a message using a Snackbar.
  void showMessage(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : Colors.green,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  /// Initiates OAuth login flow with the specified provider
  Future<void> loginWithOAuth(OAuthProvider provider) async {
    if (_isLoading) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      showMessage("Starting ${provider.name} login...");

      final result = await privyManager.privy.oAuth.login(
        provider: provider,
        // Pass the custom URL scheme registered in Info.plist and AndroidManifest.xml
        appUrlScheme: "privytestappflutter",
      );

      result.fold(
        onSuccess: (user) {
          // Pass the user directly to the authenticated screen
          if (mounted) {
            context.go(AppRouter.authenticatedPath, extra: user);
          }
        },
        onFailure: (error) {
          setState(() {
            _isLoading = false;
            _errorMessage = "Login error: ${error.message}";
          });
          showMessage(_errorMessage!, isError: true);
        },
      );
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = "Login error: $e";
      });
      showMessage(_errorMessage!, isError: true);
    }
  }

  /// Returns the display name for the OAuth provider
  String getProviderDisplayName(OAuthProvider provider) {
    switch (provider) {
      case OAuthProvider.google:
        return "Google";
      case OAuthProvider.apple:
        return "Apple";
      case OAuthProvider.twitter:
        return "Twitter";
      case OAuthProvider.discord:
        return "Discord";
      }
  }

  /// Returns the appropriate icon for the OAuth provider
  IconData getProviderIcon(OAuthProvider provider) {
    switch (provider) {
      case OAuthProvider.google:
        return Icons.login; // You can replace with actual Google icon
      case OAuthProvider.apple:
        return Icons.apple;
      case OAuthProvider.twitter:
        return Icons.alternate_email; // Twitter-like icon
      case OAuthProvider.discord:
        return Icons.chat; }
  }

  /// Returns the appropriate color for the OAuth provider
  Color getProviderColor(OAuthProvider provider) {
    switch (provider) {
      case OAuthProvider.google:
        return Colors.red;
      case OAuthProvider.apple:
        return Colors.black;
      case OAuthProvider.twitter:
        return Colors.blue;
      case OAuthProvider.discord:
        return const Color(0xFF5865F2); }
  }

  /// Builds an OAuth login button for the specified provider
  Widget buildOAuthButton(OAuthProvider provider) {
    
    final displayName = getProviderDisplayName(provider);

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: ElevatedButton.icon(
        onPressed: _isLoading ? null : () => loginWithOAuth(provider),
        icon: _isLoading
            ? SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    Theme.of(context).colorScheme.onPrimary,
                  ),
                ),
              )
            : Icon(getProviderIcon(provider)),
        label: Text(
          _isLoading
              ? "Signing in..."
              : "Continue with $displayName",
          style: const TextStyle(fontSize: 16),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: getProviderColor(provider),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Login with OAuth"),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/'),
        ),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                "Choose an OAuth Provider",
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              // Google Login Button
              ElevatedButton.icon(
                icon: const Icon(Icons.g_mobiledata, size: 30),
                onPressed: _isLoading
                    ? null
                    : () => loginWithOAuth(OAuthProvider.google),
                label: const Text("Login with Google"),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black,
                ),
              ),
              const SizedBox(height: 20),
              // Twitter Login Button
              ElevatedButton.icon(
                icon: const Icon(Icons.flutter_dash, size: 24),
                onPressed: _isLoading
                    ? null
                    : () => loginWithOAuth(OAuthProvider.twitter),
                label: const Text("Login with Twitter"),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                ),
              ),
              const SizedBox(height: 20),
              // Discord Login Button
              ElevatedButton.icon(
                icon: const Icon(Icons.discord, size: 24),
                onPressed: _isLoading
                    ? null
                    : () => loginWithOAuth(OAuthProvider.discord),
                label: const Text("Login with Discord"),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  backgroundColor: const Color(0xFF5865F2),
                  foregroundColor: Colors.white,
                ),
              ),
              // Apple Login Button (iOS only)
              const SizedBox(height: 20),
              ElevatedButton.icon(
                icon: const Icon(Icons.apple, size: 24),
                onPressed: _isLoading
                    ? null
                    : () => loginWithOAuth(OAuthProvider.apple),
                label: const Text("Sign in with Apple"),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  backgroundColor: Colors.black,
                  foregroundColor: Colors.white,
                ),
              ),
              const SizedBox(height: 30),
              if (_isLoading)
                const Center(
                  child: CircularProgressIndicator(),
                ),
              if (_errorMessage != null)
                Padding(
                  padding: const EdgeInsets.only(top: 20),
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}