import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  int step = 0;
  TimeOfDay sleepTime = const TimeOfDay(hour: 23, minute: 0);
  bool alarmEnabled = false;
  TimeOfDay alarmTime = const TimeOfDay(hour: 7, minute: 30);
  String timezoneMode = 'auto';

  void next() {
    setState(() => step = (step + 1).clamp(0, 3));
  }

  Future<void> finish() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('seen_onboarding', true);
    await prefs.setString('tz_mode', timezoneMode);
    await prefs.setInt('sleep_h', sleepTime.hour);
    await prefs.setInt('sleep_m', sleepTime.minute);
    await prefs.setBool('alarm_enabled', alarmEnabled);
    await prefs.setInt('alarm_h', alarmTime.hour);
    await prefs.setInt('alarm_m', alarmTime.minute);
    if (mounted) Navigator.of(context).pushReplacementNamed('/home');
  }

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      _StepWrapper(
        title: 'ТыКлассный. Просто будучи собой 🤍',
        description: 'Warmly — твоё ежедневное напоминание: ты достаточно хорош.',
        child: const SizedBox(),
        primary: 'Начнём',
        onPrimary: next,
      ),
      _StepWrapper(
        title: 'В каком ты часовом поясе?',
        description: 'Автоматически (по устройству) рекомендуется',
        child: Column(
          children: [
            RadioListTile(
              value: 'auto',
              groupValue: timezoneMode,
              title: const Text('Автоматически'),
              onChanged: (v) => setState(() => timezoneMode = v as String),
            ),
            RadioListTile(
              value: 'manual',
              groupValue: timezoneMode,
              title: const Text('Вручную (выбрать позже в настройках)'),
              onChanged: (v) => setState(() => timezoneMode = v as String),
            ),
          ],
        ),
        primary: 'Дальше',
        onPrimary: next,
      ),
      _StepWrapper(
        title: 'Во сколько ты обычно ложишься спать?',
        description: 'Мы пожелаем спокойной ночи за ~10 минут до этого времени',
        child: TextButton(
          onPressed: () async {
            final picked = await showTimePicker(context: context, initialTime: sleepTime);
            if (picked != null) setState(() => sleepTime = picked);
          },
          child: Text('${sleepTime.format(context)}'),
        ),
        primary: 'Дальше',
        onPrimary: next,
      ),
      _StepWrapper(
        title: 'Будильник на утро',
        description: 'Хочешь мягкое пробуждение с тёплым словом?',
        child: Column(
          children: [
            SwitchListTile(
              value: alarmEnabled,
              onChanged: (v) => setState(() => alarmEnabled = v),
              title: const Text('Включить будильник'),
            ),
            if (alarmEnabled)
              TextButton(
                onPressed: () async {
                  final picked = await showTimePicker(context: context, initialTime: alarmTime);
                  if (picked != null) setState(() => alarmTime = picked);
                },
                child: Text('${alarmTime.format(context)}'),
              ),
          ],
        ),
        primary: 'Готово — показать Warmly! ',
        onPrimary: finish,
      ),
    ];

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: pages[step],
        ),
      ),
    );
  }
}

class _StepWrapper extends StatelessWidget {
  final String title;
  final String description;
  final Widget child;
  final String primary;
  final VoidCallback onPrimary;

  const _StepWrapper({
    required this.title,
    required this.description,
    required this.child,
    required this.primary,
    required this.onPrimary,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 24),
        Center(child: Icon(Icons.wb_sunny, size: 64, color: Colors.orangeAccent)),
        const SizedBox(height: 24),
        Text(title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Text(description, style: const TextStyle(color: Colors.black54)),
        const SizedBox(height: 16),
        child,
        const Spacer(),
        ElevatedButton(onPressed: onPrimary, child: Text(primary)),
      ],
    );
  }
}