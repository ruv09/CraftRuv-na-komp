import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz;
import 'package:audioplayers/audioplayers.dart';

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
        onTap: (index) {
          if (index == 1) {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const ArchiveScreen()));
          }
          if (index == 2) {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const SettingsScreen()));
          }
        },
        selectedItemColor: const Color(0xFFE67E6B),
      ),
    );
  }
}

// ============ ЗВУКИ ============
class SoundService {
  static final SoundService _instance = SoundService._internal();
  factory SoundService() => _instance;
  SoundService._internal();

  final AudioPlayer _player = AudioPlayer();
  bool _isPlaying = false;

  Future<void> play(String assetPath) async {
    if (_isPlaying) return;
    _isPlaying = true;
    await _player.play(AssetSource(assetPath));
    _isPlaying = false;
  }

  Future<void> stop() async {
    await _player.stop();
    _isPlaying = false;
  }
}

// ============ УВЕДОМЛЕНИЯ ============
class NotificationService {
  static final FlutterLocalNotificationsPlugin _notificationsPlugin = FlutterLocalNotificationsPlugin();

  static Future<void> init() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const darwinSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    const settings = InitializationSettings(android: androidSettings, iOS: darwinSettings);
    await _notificationsPlugin.initialize(
      settings,
      onDidReceiveNotificationResponse: (NotificationResponse response) async {
        if (response.payload == 'alarm') {
          final prefs = await SharedPreferences.getInstance();
          final path = prefs.getString('alarm_sound') ?? AlarmSoundCatalog.defaultSound;
          await SoundService().play(path);
        }
      },
    );
    await _notificationsPlugin
        .resolvePlatformSpecificImplementation<IOSFlutterLocalNotificationsPlugin>()
        ?.requestPermissions(alert: true, badge: true, sound: true);
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
      payload: 'alarm',
    );
  }
}

// ============ ЭКРАН «ПОДЕЛИТЬСЯ ТЕПЛОМ» ============
class ShareScreen extends StatelessWidget {
  const ShareScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Поделись теплом"),
        backgroundColor: const Color(0xFFE67E6B),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const Text("Выбери фразу для друга:", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            ...[
              "Ты — чудо. Просто так.",
              "Ты не один. Ты важен. Ты любим.",
              "Просто так — ты сегодня классный. Точка.",
            ].map((phrase) => Card(
                  margin: const EdgeInsets.symmetric(vertical: 8),
                  child: ListTile(
                    title: Text(phrase),
                    trailing: const Icon(Icons.share),
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("Скопировано! Отправь другу ❤️")),
                      );
                    },
                  ),
                )),
            const Spacer(),
            const Text("Анонимно. Без регистрации. Просто добро.", style: TextStyle(color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}

// Временные заглушки для экранов Архив и Настройки
class ArchiveScreen extends StatelessWidget {
  const ArchiveScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Архив'), backgroundColor: const Color(0xFFE67E6B)),
      body: const Center(child: Text('Здесь будет архив фраз')),
    );
  }
}

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return const _SettingsContent();
  }
}

class _SettingsContent extends StatefulWidget {
  const _SettingsContent();

  @override
  State<_SettingsContent> createState() => _SettingsContentState();
}

class _SettingsContentState extends State<_SettingsContent> {
  String _alarmSound = AlarmSoundCatalog.defaultSound;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _alarmSound = prefs.getString('alarm_sound') ?? AlarmSoundCatalog.defaultSound;
    });
  }

  Future<void> _save(String value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('alarm_sound', value);
    setState(() => _alarmSound = value);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Звук будильника сохранён')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Настройки'), backgroundColor: const Color(0xFFE67E6B)),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const Text('Звук будильника', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            value: _alarmSound,
            items: AlarmSoundCatalog.sounds
                .map((s) => DropdownMenuItem(value: s.path, child: Text(s.title)))
                .toList(),
            onChanged: (v) {
              if (v != null) _save(v);
            },
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              ElevatedButton(
                onPressed: () => SoundService().play(_alarmSound),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE67E6B), foregroundColor: Colors.white),
                child: const Text('Прослушать'),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ShareScreen())),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.black12, foregroundColor: Colors.black87),
                child: const Text('Отправить другу'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class AlarmSoundCatalog {
  static const defaultSound = 'assets/sounds/alarm/dawn_chime.mp3';
  static final sounds = <_AlarmSound>[
    _AlarmSound('Рассвет (колокольчики)', 'assets/sounds/alarm/dawn_chime.mp3'),
    _AlarmSound('Мягкая гитара', 'assets/sounds/alarm/soft_guitar.mp3'),
    _AlarmSound('Тихое пиано', 'assets/sounds/alarm/gentle_piano.mp3'),
    _AlarmSound('Шум моря', 'assets/sounds/alarm/ocean_waves.mp3'),
    _AlarmSound('Лёгкий дождь', 'assets/sounds/alarm/light_rain.mp3'),
    _AlarmSound('Пение птиц', 'assets/sounds/alarm/morning_birds.mp3'),
    _AlarmSound('Калинба', 'assets/sounds/alarm/kalimba_soft.mp3'),
    _AlarmSound('Тибетские чаши', 'assets/sounds/alarm/tibetan_bowls.mp3'),
    _AlarmSound('Ветерок', 'assets/sounds/alarm/soft_wind.mp3'),
    _AlarmSound('Аmbient пад', 'assets/sounds/alarm/ambient_pad.mp3'),
    _AlarmSound('Лёгкие колокольчики', 'assets/sounds/alarm/light_bells.mp3'),
    _AlarmSound('Тёплый синт', 'assets/sounds/alarm/warm_synth.mp3'),
    _AlarmSound('Глюкоспил', 'assets/sounds/alarm/glockenspiel.mp3'),
    _AlarmSound('Тихий ручей', 'assets/sounds/alarm/soft_stream.mp3'),
    _AlarmSound('Костёр', 'assets/sounds/alarm/campfire_soft.mp3'),
  ];
}

class _AlarmSound {
  final String title;
  final String path;
  const _AlarmSound(this.title, this.path);
}
