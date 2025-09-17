import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_starter/router/app_router.dart';
import 'package:privy_flutter/privy_flutter.dart';

/// NavigationManager handles all app navigation logic
class NavigationManager {
  // Singleton pattern
  static final NavigationManager _instance = NavigationManager._internal();
  factory NavigationManager() => _instance;
  NavigationManager._internal();

  /// Navigate to authenticated screen
  void navigateToAuthenticatedScreen(BuildContext context, {PrivyUser? user}) {
    if (!_isValidContext(context)) return;
    
    final router = GoRouter.of(context);
    final currentPath = router.routeInformationProvider.value.uri.path;

    // Only navigate if not already on the authenticated path
    if (currentPath != AppRouter.authenticatedPath) {
      debugPrint('Navigating to authenticated screen');

      WidgetsBinding.instance.addPostFrameCallback((_) {
        router.go(AppRouter.authenticatedPath, extra: user);
      });
    } else {
      debugPrint('Already on authenticated path, skipping navigation');
    }
  }
  
  /// Check if context is valid for navigation
  bool _isValidContext(BuildContext? context) {
    if (context == null) return false;
    
    try {
      return context.mounted;
    } catch (e) {
      return false;
    }
  }
}

// Global instance for easy access
final navigationManager = NavigationManager();
