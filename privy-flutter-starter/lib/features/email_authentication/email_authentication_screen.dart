import 'package:flutter/material.dart';
import 'package:flutter_starter/core/privy_manager.dart';
import 'package:flutter_starter/router/app_router.dart';
import 'package:flutter_starter/models/auth_action.dart';
import 'package:go_router/go_router.dart';

class EmailAuthenticationScreen extends StatefulWidget {
  final AuthAction authAction;

  const EmailAuthenticationScreen({super.key, required this.authAction});

  @override
  EmailAuthenticationScreenState createState() =>
      EmailAuthenticationScreenState();
}

class EmailAuthenticationScreenState extends State<EmailAuthenticationScreen> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController codeController = TextEditingController();
  bool codeSent = false;
  String? errorMessage;
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    // Pre-fill email if updating
    if (widget.authAction is Update) {
      emailController.text = (widget.authAction as Update).currentValue;
    }
  }

  String _getScreenTitle() {
    switch (widget.authAction) {
      case Login():
        return 'Email Authentication';
      case Link():
        return 'Link Email Account';
      case Update(currentValue: _):
        return 'Update Email Address';
    }
  }

  String _getActionButtonText() {
    switch (widget.authAction) {
      case Login():
        return 'Verify & Login';
      case Link():
        return 'Verify & Link';
      case Update(currentValue: _):
        return 'Verify & Update';
    }
  }

  void _handleBackNavigation() {
    switch (widget.authAction) {
      case Login():
        context.go('/');
      case Link():
      case Update(currentValue: _):
        Navigator.of(context).pop();
    }
  }

  /// Shows a message using a Snackbar
  void showMessage(String message, {bool isError = false}) {
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : Colors.green,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  /// Sends OTP to the provided email
  ///
  /// NOTE: To use email authentication, you must enable it in the Privy Dashboard:
  /// https://dashboard.privy.io/apps?page=login-methods
  Future<void> sendCode() async {
    // Get and validate the email input
    String email = emailController.text.trim();
    if (email.isEmpty) {
      showMessage("Please enter your email", isError: true);
      return;
    }

    // Update UI to show loading state and clear any previous errors
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      // Call Privy SDK to send verification code
      // This makes an API request to Privy's authentication service
      final result = await privyManager.privy.email.sendCode(email);

      // Handle the result using Privy's Result type which has onSuccess and onFailure handlers
      result.fold(
        // Success handler - code was sent successfully
        onSuccess: (_) {
          setState(() {
            codeSent =
                true; // This will trigger UI to show the code input field
            errorMessage = null;
            isLoading = false;
          });
          showMessage("Code sent successfully to $email");
        },
        // Failure handler - something went wrong on Privy's end
        onFailure: (error) {
          setState(() {
            errorMessage = error.message; // Store error message from Privy
            codeSent = false; // Ensure code input remains hidden
            isLoading = false;
          });
          showMessage("Error sending code: ${error.message}", isError: true);
        },
      );
    } catch (e) {
      // Handle unexpected exceptions (network issues, etc.)
      setState(() {
        isLoading = false;
        errorMessage = e.toString();
      });
      showMessage("Unexpected error: $e", isError: true);
    }
  }

  /// Performs authentication action based on the type
  Future<void> performAuthAction() async {
    // Validate the verification code input
    String code = codeController.text.trim();
    if (code.isEmpty) {
      showMessage("Please enter the verification code", isError: true);
      return;
    }

    // Update UI to show loading state and clear previous errors
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      switch (widget.authAction) {
        case Login():
          // Handle login case
          final result = await privyManager.privy.email.loginWithCode(
            code: code,
            email: emailController.text.trim(),
          );

          result.fold(
            onSuccess: (user) {
              setState(() {
                isLoading = false;
              });
              showMessage("Authentication successful!");
              if (mounted) {
                context.go(AppRouter.authenticatedPath, extra: user);
              }
            },
            onFailure: (error) {
              setState(() {
                errorMessage = error.message;
                isLoading = false;
              });
              showMessage("Login error: ${error.message}", isError: true);
            },
          );

        case Link():
          // Handle linking case
          final result = await privyManager.privy.email.linkWithCode(
            code: code,
            email: emailController.text.trim(),
          );

          result.fold(
            onSuccess: (_) {
              setState(() {
                isLoading = false;
              });
              showMessage("Email linked successfully!");
              if (mounted) {
                Navigator.of(context).pop(true);
              }
            },
            onFailure: (error) {
              setState(() {
                errorMessage = error.message;
                isLoading = false;
              });
              showMessage("Linking error: ${error.message}", isError: true);
            },
          );

        case Update(currentValue: _):
          // Handle update case
          final result = await privyManager.privy.email.updateWithCode(
            code: code,
            email: emailController.text.trim(),
          );

          result.fold(
            onSuccess: (_) {
              setState(() {
                isLoading = false;
              });
              showMessage("Email updated successfully!");
              if (mounted) {
                Navigator.of(context).pop(true);
              }
            },
            onFailure: (error) {
              setState(() {
                errorMessage = error.message;
                isLoading = false;
              });
              showMessage("Update error: ${error.message}", isError: true);
            },
          );
      }
    } catch (e) {
      // Handle unexpected exceptions (network issues, etc.)
      setState(() {
        isLoading = false;
        errorMessage = e.toString();
      });
      showMessage("Unexpected error: $e", isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        title: Text(_getScreenTitle()),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => _handleBackNavigation(),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Center(
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  _getScreenTitle(),
                  style: Theme.of(context).textTheme.headlineLarge,
                  textAlign: TextAlign.center,
                ),
                // Add spacing and a divider before the logo

                // Privy Logo
                Center(
                  child: Image.asset(
                    'lib/assets/privy_logo.png',
                    height: 180,
                    width: 250,
                  ),
                ),

                // Email input field
                TextField(
                  controller: emailController,
                  decoration: InputDecoration(
                    labelText: "Email address",
                    border: const OutlineInputBorder(),
                    labelStyle: Theme.of(context).textTheme.bodyLarge,
                  ),
                  keyboardType: TextInputType.emailAddress,
                  autocorrect: false,
                  enabled: !isLoading,
                ),
                const SizedBox(height: 20),

                // Send code button
                ElevatedButton(
                  onPressed: isLoading ? null : sendCode,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Text(
                      isLoading && !codeSent
                          ? "Sending..."
                          : "Send Verification Code",
                    ),
                  ),
                ),

                // Show verification code input and login button if code was sent
                if (codeSent) ...[
                  const SizedBox(height: 30),
                  const Divider(),
                  const SizedBox(height: 30),

                  TextField(
                    controller: codeController,
                    decoration: InputDecoration(
                      labelText: "Verification Code",
                      border: const OutlineInputBorder(),
                      labelStyle: Theme.of(context).textTheme.bodyLarge,
                    ),
                    keyboardType: TextInputType.number,
                    enabled: !isLoading,
                  ),
                  const SizedBox(height: 20),

                  ElevatedButton(
                    onPressed: isLoading ? null : performAuthAction,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Text(
                        isLoading ? "Verifying..." : _getActionButtonText(),
                      ),
                    ),
                  ),
                ],

                // Show error message if any
                if (errorMessage != null) ...[
                  const SizedBox(height: 20),
                  Text(
                    errorMessage!,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Theme.of(context).colorScheme.error,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    emailController.dispose();
    codeController.dispose();
    super.dispose();
  }
}
