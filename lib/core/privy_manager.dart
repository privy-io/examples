import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_starter/config/env_config.dart';
import 'package:flutter_starter/core/navigation_manager.dart';
import 'package:privy_flutter/privy_flutter.dart';

/// A singleton class to manage the Privy initialization and instance
class PrivyManager {
  // Private constructor
  PrivyManager._();

  // Singleton instance
  static final PrivyManager _instance = PrivyManager._();

  // Factory constructor to return the singleton instance
  factory PrivyManager() => _instance;

  // Reference to the Privy SDK instance
  Privy? _privySdk;

  /// Getter to access the initialized Privy instance
  /// Throws an exception if accessed before initialization
  Privy get privy {
    if (_instance._privySdk == null) {
      throw Exception(
        'PrivyManager has not been initialized. Call initialize() first.',
      );
    }
    return _instance._privySdk!;
  }

  /// Whether the Privy SDK has been initialized
  bool get isInitialized => _privySdk != null;

  /// Initialize Privy with the credentials from env config
  void initializePrivy() {
    try {
      final privyConfig = PrivyConfig(
        appId: EnvConfig.privyAppId,
        appClientId: EnvConfig.privyClientId,
        logLevel: PrivyLogLevel.debug,
      );

      _privySdk = Privy.init(config: privyConfig);
      debugPrint('Privy SDK initialized');
    } catch (e, stack) {
      debugPrint('Privy initialization failed: $e\n$stack');
      rethrow;
    }
  }
}

/// Convenient singleton accessor for Privy Manger instance
PrivyManager get privyManager => PrivyManager();
