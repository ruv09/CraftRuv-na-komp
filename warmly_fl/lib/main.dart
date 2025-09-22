import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  tz.initializeTimeZones();
  await NotificationService.init();
  final prefs = await SharedPreferences.getInstance();
  final isFirstRun = prefs.getBool('isFirstRun') ?? true;

  runApp(MyApp(isFirstRun: isFirstRun));
}

class MyApp extends StatelessWidget {
  final bool isFirstRun;
  const MyApp({super.key, required this.isFirstRun});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Warmly',
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFFF5EE),
        fontFamily: 'Nunito',
      ),
      home: isFirstRun ? const OnboardingScreen() : const HomeScreen(),
    );
  }
}

// ============ ОНБОРДИНГ ============
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  int _currentPage = 0;
  final PageController _controller = PageController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView(
        controller: _controller,
        onPageChanged: (index) => setState(() => _currentPage = index),
        children: const [
          OnboardingStep(
            title: "ТыКлассный. Просто будучи собой 🤍",
            subtitle: "Warmly — твоё ежедневное напоминание: ты достаточно хорош. Прямо сейчас.",
            buttonText: "Начнём",
          ),
          TimeZoneStep(),
          SleepTimeStep(),
          AlarmStep(),
        ],
      ),
    );
  }
}

class OnboardingStep extends StatelessWidget {
  final String title, subtitle, buttonText;
  final VoidCallback? onPressed;

  const OnboardingStep({
    super.key,
    required this.title,
    required this.subtitle,
    required this.buttonText,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(title, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
            const SizedBox(height: 24),
            Text(subtitle, style: const TextStyle(fontSize: 18, height: 1.5), textAlign: TextAlign.center),
            const Spacer(),
            ElevatedButton(
              onPressed: onPressed ?? () {
                final controller = PageView.of(context);
                if (controller.page! < 3) {
                  controller.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.ease);
                } else {
                  _finishOnboarding(context);
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE67E6B),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: Text(buttonText),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Future<void> _finishOnboarding(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isFirstRun', false);
    await prefs.setString('alarm_time', '07:30');
    await prefs.setBool('alarm_enabled', true);

    final now = DateTime.now();
    final tomorrow = DateTime(now.year, now.month, now.day + 1, 7, 30);
    await NotificationService.scheduleNotification(
      id: 1,
      title: "Warmly",
      body: "Доброе утро 🌞 Ты уже сделал самое сложное — проснулся.",
      scheduledTime: tomorrow,
    );
    if (!mounted) return;
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) => const HomeScreen()),
      (route) => false,
    );
  }
}

class TimeZoneStep extends StatelessWidget {
  const TimeZoneStep({super.key});

  @override
  Widget build(BuildContext context) {
    return OnboardingStep(
      title: "🌍 В каком ты часовом поясе?",
      subtitle: "Выбери автоматически — или укажи вручную",
      buttonText: "Дальше",
      onPressed: () {
        final controller = PageView.of(context);
        controller.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.ease);
      },
    );
  }
}

class SleepTimeStep extends StatelessWidget {
  const SleepTimeStep({super.key});

  @override
  Widget build(BuildContext context) {
    return OnboardingStep(
      title: "🌙 Во сколько ты обычно ложишься спать?",
      subtitle: "Мы будем желать тебе спокойной ночи за 10 минут до этого времени",
      buttonText: "Дальше",
      onPressed: () {
        final controller = PageView.of(context);
        controller.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.ease);
      },
    );
  }
}

class AlarmStep extends StatelessWidget {
  const AlarmStep({super.key});

  @override
  Widget build(BuildContext context) {
    return OnboardingStep(
      title: "🌅 Хочешь, чтобы мы будили тебя тёплым словом?",
      subtitle: "Мы будем будить тебя в это время с мотивацией и комплиментом.",
      buttonText: "Готово — показать Warmly!",
      onPressed: () {
        final prefs = SharedPreferences.getInstance();
        prefs.then((p) async {
          await p.setBool('isFirstRun', false);
          await p.setString('alarm_time', '07:30');
          await p.setBool('alarm_enabled', true);
          final now = DateTime.now();
          final tomorrow = DateTime(now.year, now.month, now.day + 1, 7, 30);
          await NotificationService.scheduleNotification(
            id: 1,
            title: "Warmly",
            body: "Доброе утро 🌞 Ты уже сделал самое сложное — проснулся.",
            scheduledTime: tomorrow,
          );
        });
        Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) => const HomeScreen()), (route) => false);
      },
    );
  }
}

// ============ ГЛАВНЫЙ ЭКРАН (обновлённый) ============
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Warmly", style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFFE67E6B),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                "Доброе утро 🌞",
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 24),
              Text(
                "Ты уже сделал самое сложное — проснулся. Остальное — детали.",
                style: TextStyle(
                  fontSize: 20,
                  fontStyle: FontStyle.italic,
                  color: Colors.black87,
                ),
                textAlign: TextAlign.center,
              ),
              const Spacer(),
              ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE67E6B),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text("Как ты? 😊 😐 😞"),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "Домой"),
          BottomNavigationBarItem(icon: Icon(Icons.book), label: "Архив"),
          BottomNavigationBarItem(icon: Icon(Icons.settings), label: "Настройки"),
        ],
        onTap: (index) {},
        selectedItemColor: const Color(0xFFE67E6B),
      ),
    );
  }
}

// ============ УВЕДОМЛЕНИЯ ============
class NotificationService {
  static final FlutterLocalNotificationsPlugin _notificationsPlugin = FlutterLocalNotificationsPlugin();

  static Future<void> init() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const darwinSettings = DarwinInitializationSettings();
    const settings = InitializationSettings(android: androidSettings, iOS: darwinSettings);
    await _notificationsPlugin.initialize(settings);
  }

  static Future<void> scheduleNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledTime,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'warmly_channel',
      'Warmly Notifications',
      channelDescription: 'Тёплые слова для тебя',
      priority: Priority.high,
      importance: Importance.high,
    );
    const darwinDetails = DarwinNotificationDetails();
    const details = NotificationDetails(android: androidDetails, iOS: darwinDetails);

    await _notificationsPlugin.zonedSchedule(
      id,
      title,
      body,
      tz.TZDateTime.from(scheduledTime, tz.local),
      details,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      matchDateTimeComponents: null,
    );
  }
}
