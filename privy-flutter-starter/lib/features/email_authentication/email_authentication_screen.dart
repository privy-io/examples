import 'package:flutter/material.dart';
import 'package:flutter_starter/core/privy_manager.dart';
import 'package:flutter_starter/router/app_router.dart';
import 'package:go_router/go_router.dart';


class EmailAuthenticationScreen extends StatefulWidget {
  const EmailAuthenticationScreen({super.key});

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

  /// Logs in using code and email, then navigates to the authenticated screen on success
  Future<void> login() async {
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
      // Call Privy SDK to verify the code and complete authentication
      // This performs verification against Privy's authentication service
      final result = await privyManager.privy.email.loginWithCode(
        code: code, // The verification code entered by user
        email:
            emailController.text.trim(), // The email address to verify against
      );

      // Handle the authentication result
      result.fold(
        // Success handler - user was authenticated
        onSuccess: (user) {
          // user is a PrivyUser object containing the authenticated user's information
          setState(() {
            isLoading = false;
          });
          showMessage("Authentication successful!");

          // Navigate to authenticated screen
          if (mounted) {
            context.go(AppRouter.authenticatedPath);
          }
        },
        // Failure handler - authentication failed
        onFailure: (error) {
          // Common failures: invalid code, expired code, too many attempts
          setState(() {
            errorMessage = error.message;
            isLoading = false;
          });
          showMessage("Login error: ${error.message}", isError: true);
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        title: const Text('Email Authentication'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/'),
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
                  'Login with Email',
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
                    onPressed: isLoading ? null : login,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Text(
                        isLoading ? "Verifying..." : "Verify & Login",
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
