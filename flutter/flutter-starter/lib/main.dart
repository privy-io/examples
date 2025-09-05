import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_starter/router/app_router.dart';

Future<void> main() async {

  // Load environment variables before running the app
  await dotenv.load(fileName: '.env');
  
  runApp(const MyPrivyStarterApp());
}

class MyPrivyStarterApp extends StatelessWidget {
  const MyPrivyStarterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: "Privy Starter Repo",
      debugShowCheckedModeBanner: false,
      routerConfig: AppRouter().router,
      theme: ThemeData(
        // Use Material 3 design system
        useMaterial3: true,
        
        // Set the scaffold and app background to pure white
        scaffoldBackgroundColor: Colors.white,
        colorScheme: ColorScheme.light(
          // Primary color used for main UI components
          primary: Colors.black,
          // Background colors
          background: Colors.white,
          surface: Colors.white,
          // Text colors
          onPrimary: Colors.white,
          onBackground: Colors.black,
          onSurface: Colors.black,
        ),
        
        // AppBar theme
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0,
          centerTitle: false,
        ),
        
        // Button themes
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.white,
            foregroundColor: Colors.black,
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
              side: const BorderSide(color: Colors.black, width: 1),
            ),
            textStyle: const TextStyle(fontSize: 16),
          ),
        ),
        
        // Typography
        textTheme: const TextTheme(
          headlineLarge: TextStyle(color: Colors.black, fontSize: 32, fontWeight: FontWeight.bold),
          headlineMedium: TextStyle(color: Colors.black, fontSize: 24, fontWeight: FontWeight.bold),
          titleLarge: TextStyle(color: Colors.black, fontSize: 20, fontWeight: FontWeight.w500),
          bodyLarge: TextStyle(color: Colors.black, fontSize: 16),
          bodyMedium: TextStyle(color: Colors.black, fontSize: 14),
        ),
      ),
    );
  }
}
