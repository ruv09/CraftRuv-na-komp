import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'screens/onboarding_screen.dart';
import 'screens/home_screen.dart';
import 'screens/mood_screen.dart';
import 'screens/archive_screen.dart';
import 'screens/send_screen.dart';
import 'screens/settings_screen.dart';
import 'services/notifications_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await NotificationsService.init();
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

    // schedule notifications if enabled
    final alarmEnabled = prefs.getBool('alarm_enabled') ?? false;
    final alarmH = prefs.getInt('alarm_h') ?? 7;
    final alarmM = prefs.getInt('alarm_m') ?? 30;
    final pushMorning = prefs.getBool('push_morning') ?? true;
    final pushEvening = prefs.getBool('push_evening') ?? true;
    final sleepH = prefs.getInt('sleep_h') ?? 23;
    final sleepM = prefs.getInt('sleep_m') ?? 0;

    if (pushMorning) {
      await NotificationsService.scheduleDaily(
        id: 100,
        hour: alarmEnabled ? alarmH : 9,
        minute: alarmEnabled ? alarmM : 0,
        title: 'Доброе утро',
        body: 'Ты уже сделал самое сложное — проснулся. Этого достаточно.',
      );
    } else {
      await NotificationsService.cancel(100);
    }

    if (pushEvening) {
      final evHour = (sleepH * 60 + sleepM - 10) ~/ 60 % 24;
      final evMin = (sleepH * 60 + sleepM - 10) % 60;
      await NotificationsService.scheduleDaily(
        id: 200,
        hour: evHour,
        minute: evMin,
        title: 'Спокойной ночи',
        body: 'Сегодня ты сделал достаточно. Отдых — тоже достижение.',
      );
    } else {
      await NotificationsService.cancel(200);
    }

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
