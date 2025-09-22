import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:share_plus/share_plus.dart';
import 'dart:convert';
import 'package:flutter/services.dart' show rootBundle;
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
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final String _phrase = "Ты уже сделал самое сложное — проснулся. Остальное — детали.";
  late Future<Map<String, String>> _i18n;

  @override
  void initState() {
    super.initState();
    _i18n = _loadI18n();
  }

  Future<Map<String, String>> _loadI18n() async {
    final p = await SharedPreferences.getInstance();
    final lang = p.getString('lang') ?? 'ru';
    final content = await rootBundle.loadString('assets/i18n/strings_${lang}.json');
    final map = json.decode(content) as Map<String, dynamic>;
    return map.map((k, v) => MapEntry(k, v.toString()));
  }

  Future<void> _saveFavorite() async {
    final p = await SharedPreferences.getInstance();
    final list = p.getStringList('favorites') ?? <String>[];
    if (!list.contains(_phrase)) {
      list.add(_phrase);
      await p.setStringList('favorites', list);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Сохранено в архив')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, String>>(
      future: _i18n,
      builder: (context, snap) {
        final t = (String k) => (snap.data ?? const {})[k] ?? k;
        return Scaffold(
      appBar: AppBar(
        title: Text(t('app_title'), style: const TextStyle(color: Colors.white)),
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
              Text(t('good_morning'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 24),
              Text(
                _phrase,
                style: TextStyle(
                  fontSize: 20,
                  fontStyle: FontStyle.italic,
                  color: Colors.black87,
                ),
                textAlign: TextAlign.center,
              ),
              const Spacer(),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ElevatedButton.icon(
                    onPressed: _saveFavorite,
                    icon: const Icon(Icons.favorite_border),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE67E6B),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    label: Text(t('add_to_archive')),
                  ),
                  const SizedBox(width: 12),
                  OutlinedButton.icon(
                    onPressed: () => Share.share(_phrase),
                    icon: const Icon(Icons.share),
                    label: Text(t('share')),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MoodScreen())),
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
      },
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
    await _notificationsPlugin.initialize(settings);
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
    final androidDetails = AndroidNotificationDetails(
      'warmly_channel',
      'Warmly Notifications',
      channelDescription: 'Тёплые слова для тебя',
      priority: Priority.high,
      importance: Importance.high,
      playSound: true,
    );
    final darwinDetails = DarwinNotificationDetails(
      presentSound: true,
    );
    final details = NotificationDetails(android: androidDetails, iOS: darwinDetails);

    await _notificationsPlugin.zonedSchedule(
      id,
      title,
      body,
      tz.TZDateTime.from(scheduledTime, tz.local),
      details,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      matchDateTimeComponents: DateTimeComponents.time,
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

// ============ ЭКРАН «НАСТРОЕНИЕ» ============
class MoodScreen extends StatefulWidget {
  const MoodScreen({super.key});

  @override
  State<MoodScreen> createState() => _MoodScreenState();
}

class _MoodScreenState extends State<MoodScreen> {
  String? _mood; // good | ok | bad
  String? _text;

  void _pick(String mood) {
    setState(() {
      _mood = mood;
      _text = switch (mood) {
        'good' => 'Сохрани это ощущение — оно твоё.',
        'ok' => 'Нормально — это тоже нормально. Сделай мягкий вдох.',
        _ => 'Если тяжело — это не навсегда. Ты не один.',
      };
    });
  }

  Future<void> _save() async {
    if (_text == null) return;
    final p = await SharedPreferences.getInstance();
    final list = p.getStringList('favorites') ?? <String>[];
    list.add(_text!);
    await p.setStringList('favorites', list);
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Сохранено в архив')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Как ты?'), backgroundColor: const Color(0xFFE67E6B)),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Wrap(spacing: 8, children: [
              ChoiceChip(label: const Text('😊 Хорошо'), selected: _mood == 'good', onSelected: (_) => _pick('good')),
              ChoiceChip(label: const Text('😐 Нормально'), selected: _mood == 'ok', onSelected: (_) => _pick('ok')),
              ChoiceChip(label: const Text('😞 Плохо'), selected: _mood == 'bad', onSelected: (_) => _pick('bad')),
            ]),
            const SizedBox(height: 16),
            if (_text != null)
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                  child: Center(child: Text(_text!, textAlign: TextAlign.center, style: const TextStyle(fontSize: 20, fontStyle: FontStyle.italic))),
                ),
              ),
            const SizedBox(height: 12),
            if (_text != null)
              ElevatedButton(
                onPressed: _save,
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE67E6B), foregroundColor: Colors.white),
                child: const Text('Сохранить в архив'),
              ),
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
    return const _ArchiveContent();
  }
}

class _ArchiveContent extends StatefulWidget {
  const _ArchiveContent();

  @override
  State<_ArchiveContent> createState() => _ArchiveContentState();
}

class _ArchiveContentState extends State<_ArchiveContent> {
  List<String> _items = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final p = await SharedPreferences.getInstance();
    setState(() => _items = (p.getStringList('favorites') ?? <String>[]).reversed.toList());
  }

  Future<void> _remove(int index) async {
    final p = await SharedPreferences.getInstance();
    final list = p.getStringList('favorites') ?? <String>[];
    // convert reversed index to real index
    final realIndex = list.length - 1 - index;
    list.removeAt(realIndex);
    await p.setStringList('favorites', list);
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Архив'), backgroundColor: const Color(0xFFE67E6B)),
      body: _items.isEmpty
          ? const Center(child: Padding(padding: EdgeInsets.all(24), child: Text('Здесь будут жить твои любимые фразы. Нажми ❤, чтобы сохранить.')))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _items.length,
              itemBuilder: (context, i) {
                final text = _items[i];
                return Card(
                  child: ListTile(
                    title: Text(text),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(icon: const Icon(Icons.share), onPressed: () => Share.share(text)),
                        IconButton(icon: const Icon(Icons.delete), onPressed: () => _remove(i)),
                      ],
                    ),
                  ),
                );
              },
            ),
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

class _SettingsContent extends StatelessWidget {
  const _SettingsContent();

  @override
  Widget build(BuildContext context) {
    return const _SettingsWithTimes();
  }
}

class _SettingsWithTimes extends StatefulWidget {
  const _SettingsWithTimes();

  @override
  State<_SettingsWithTimes> createState() => _SettingsWithTimesState();
}

class _SettingsWithTimesState extends State<_SettingsWithTimes> {
  TimeOfDay _morning = const TimeOfDay(hour: 8, minute: 0);
  TimeOfDay _evening = const TimeOfDay(hour: 22, minute: 0);
  bool _morningOn = true;
  bool _eveningOn = true;
  String _lang = 'ru';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final p = await SharedPreferences.getInstance();
    setState(() {
      _morningOn = p.getBool('push_morning') ?? true;
      _eveningOn = p.getBool('push_evening') ?? true;
      _lang = p.getString('lang') ?? 'ru';
      final mh = p.getInt('morning_h') ?? 8;
      final mm = p.getInt('morning_m') ?? 0;
      final eh = p.getInt('evening_h') ?? 22;
      final em = p.getInt('evening_m') ?? 0;
      _morning = TimeOfDay(hour: mh, minute: mm);
      _evening = TimeOfDay(hour: eh, minute: em);
    });
  }

  Future<void> _saveAndSchedule() async {
    final p = await SharedPreferences.getInstance();
    await p.setBool('push_morning', _morningOn);
    await p.setBool('push_evening', _eveningOn);
    await p.setInt('morning_h', _morning.hour);
    await p.setInt('morning_m', _morning.minute);
    await p.setInt('evening_h', _evening.hour);
    await p.setInt('evening_m', _evening.minute);

    // рескейджулинг
    if (_morningOn) {
      final now = DateTime.now();
      var next = DateTime(now.year, now.month, now.day, _morning.hour, _morning.minute);
      if (next.isBefore(now)) next = next.add(const Duration(days: 1));
      await NotificationService.scheduleNotification(
        id: 100,
        title: 'Warmly',
        body: 'Доброе утро 🌞 Ты достаточно хорош — уже сейчас.',
        scheduledTime: next,
      );
    } else {
      await NotificationService.cancel(100);
    }

    if (_eveningOn) {
      final now = DateTime.now();
      var next = DateTime(now.year, now.month, now.day, _evening.hour, _evening.minute);
      if (next.isBefore(now)) next = next.add(const Duration(days: 1));
      await NotificationService.scheduleNotification(
        id: 200,
        title: 'Warmly',
        body: 'Спокойной ночи 🌙 Ты сделал достаточно. Отдых важен.',
        scheduledTime: next,
      );
    } else {
      await NotificationService.cancel(200);
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Уведомления обновлены')));
    }
  }

  Future<void> _pickMorning() async {
    final t = await showTimePicker(context: context, initialTime: _morning);
    if (t != null) setState(() => _morning = t);
  }

  Future<void> _pickEvening() async {
    final t = await showTimePicker(context: context, initialTime: _evening);
    if (t != null) setState(() => _evening = t);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Настройки'), backgroundColor: const Color(0xFFE67E6B)),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const Text('Язык интерфейса', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            value: _lang,
            items: const [
              DropdownMenuItem(value: 'ru', child: Text('Русский')),
              DropdownMenuItem(value: 'en', child: Text('English')),
            ],
            onChanged: (v) async {
              if (v == null) return;
              final p = await SharedPreferences.getInstance();
              await p.setString('lang', v);
              setState(() => _lang = v);
              if (mounted) {
                Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => MyApp(isFirstRun: false)), (r) => false);
              }
            },
          ),
          const SizedBox(height: 16),
          SwitchListTile(
            value: _morningOn,
            onChanged: (v) => setState(() => _morningOn = v),
            title: const Text('Утреннее уведомление'),
            subtitle: Text('Время: ${_morning.format(context)}'),
          ),
          ListTile(
            title: const Text('Выбрать время утра'),
            trailing: const Icon(Icons.chevron_right),
            onTap: _pickMorning,
          ),
          const Divider(),
          SwitchListTile(
            value: _eveningOn,
            onChanged: (v) => setState(() => _eveningOn = v),
            title: const Text('Вечернее уведомление'),
            subtitle: Text('Время: ${_evening.format(context)}'),
          ),
          ListTile(
            title: const Text('Выбрать время вечера'),
            trailing: const Icon(Icons.chevron_right),
            onTap: _pickEvening,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _saveAndSchedule,
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE67E6B), foregroundColor: Colors.white),
            child: const Text('Сохранить и обновить уведомления'),
          ),
          const SizedBox(height: 16),
          OutlinedButton(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ShareScreen())),
            child: const Text('Отправить другу'),
          ),
        ],
      ),
    );
  }
}
