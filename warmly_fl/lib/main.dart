import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'screens/onboarding_screen.dart';
import 'screens/home_screen.dart';
import 'screens/mood_screen.dart';
import 'screens/archive_screen.dart';
import 'screens/send_screen.dart';
import 'screens/settings_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const WarmlyApp());
}

class WarmlyApp extends StatefulWidget {
  const WarmlyApp({super.key});

  @override
  State<WarmlyApp> createState() => _WarmlyAppState();
}

class _WarmlyAppState extends State<WarmlyApp> {
  bool _loading = true;
  bool _seenOnboarding = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final seen = prefs.getBool('seen_onboarding') ?? false;
    setState(() {
      _seenOnboarding = seen;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFE67E6B)),
      scaffoldBackgroundColor: const Color(0xFFFFF5EE),
    );

    if (_loading) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: theme,
        home: const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        ),
      );
    }

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: theme,
      initialRoute: _seenOnboarding ? '/home' : '/onboarding',
      routes: {
        '/onboarding': (_) => const OnboardingScreen(),
        '/home':       (_) => const HomeScreen(),
        '/mood':       (_) => const MoodScreen(),
        '/archive':    (_) => const ArchiveScreen(),
        '/send':       (_) => const SendScreen(),
        '/settings':   (_) => const SettingsScreen(),
      },
    );
  }
}
