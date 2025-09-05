import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_starter/core/navigation_manager.dart';
import 'package:flutter_starter/core/privy_manager.dart';
import 'package:flutter_starter/router/app_router.dart';
import 'package:go_router/go_router.dart';
import 'package:privy_flutter/privy_flutter.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  HomeScreenState createState() => HomeScreenState();
}

class HomeScreenState extends State<HomeScreen> {
  bool _isPrivyReady = false;
  StreamSubscription<AuthState>? _authSubscription;

  @override
  void initState() {
    super.initState();
    _initializePrivyAndAwaitReady();
  }

  Future<void> _initializePrivyAndAwaitReady() async {
    try {
      // Initialize Privy first
      privyManager.initializePrivy();
      // Then wait for it to be ready
      await privyManager.privy.awaitReady();

      // Update state to indicate Privy is ready
      if (mounted) {
        setState(() {
          _isPrivyReady = true;
        });
        // Set up the auth listener directly in the HomeScreen
        _setupAuthListener();
      }
    } catch (e) {
      debugPrint("Error initializing Privy: $e");
    }
  }

  /// Set up listener for auth state changes
  void _setupAuthListener() {
    // Cancel any existing subscription
    _authSubscription?.cancel();
    
    // Subscribe to auth state changes
    _authSubscription = privyManager.privy.authStateStream.listen((state) {
      debugPrint('Auth state changed: $state');
      
      if (state is Authenticated && mounted) {
        debugPrint('User authenticated: ${state.user.id}');
        // Navigate to authenticated screen
        navigationManager.navigateToAuthenticatedScreen(context);
      }
    });
  }


  @override
  void dispose() {
    // Clean up subscription when widget is disposed
    _authSubscription?.cancel();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(centerTitle: true, title: const Text("Welcome to Privy")),
      body: Center(
        child:
            _isPrivyReady
                // Main content when Privy is ready
                ? Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Privy Logo from assets
                    Image.asset(
                      'lib/assets/privy_logo.png',
                      height: 180,
                      width: 250,
                    ),
                    const SizedBox(height: 24),
                    // Larger Title using theme's headlineLarge
                    Text(
                      "Privy Starter Repo",
                      style: Theme.of(context).textTheme.headlineLarge,
                    ),
                    const SizedBox(height: 30),
                    ElevatedButton(
                      onPressed: () {
                        context.go(AppRouter.emailAuthPath);
                      },
                      child: const Text('Login With Email'),
                    ),
                  ],
                )
                // Loading indicator when Privy is not ready
                : Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Using theme's primary color for loading indicator
                    CircularProgressIndicator(
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(height: 20),
                    // Using theme's text style
                    Text(
                      "Initializing Privy...",
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                  ],
                ),
      ),
    );
  }
}
