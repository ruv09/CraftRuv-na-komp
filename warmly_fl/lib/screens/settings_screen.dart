import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  String tzMode = 'auto';
  TimeOfDay sleepTime = const TimeOfDay(hour: 23, minute: 0);
  bool alarmEnabled = false;
  TimeOfDay alarmTime = const TimeOfDay(hour: 7, minute: 30);
  String language = 'ru';
  bool sounds = true;
  String alarmType = 'soft'; // soft | standard
  bool pushMorning = true;
  bool pushEvening = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final p = await SharedPreferences.getInstance();
    setState(() {
      tzMode = p.getString('tz_mode') ?? 'auto';
      sleepTime = TimeOfDay(hour: p.getInt('sleep_h') ?? 23, minute: p.getInt('sleep_m') ?? 0);
      alarmEnabled = p.getBool('alarm_enabled') ?? false;
      alarmTime = TimeOfDay(hour: p.getInt('alarm_h') ?? 7, minute: p.getInt('alarm_m') ?? 30);
      language = p.getString('lang') ?? 'ru';
      sounds = p.getBool('sounds') ?? true;
      alarmType = p.getString('alarm_type') ?? 'soft';
      pushMorning = p.getBool('push_morning') ?? true;
      pushEvening = p.getBool('push_evening') ?? true;
    });
  }

  Future<void> _save() async {
    final p = await SharedPreferences.getInstance();
    await p.setString('tz_mode', tzMode);
    await p.setInt('sleep_h', sleepTime.hour);
    await p.setInt('sleep_m', sleepTime.minute);
    await p.setBool('alarm_enabled', alarmEnabled);
    await p.setInt('alarm_h', alarmTime.hour);
    await p.setInt('alarm_m', alarmTime.minute);
    await p.setString('lang', language);
    await p.setBool('sounds', sounds);
    await p.setString('alarm_type', alarmType);
    await p.setBool('push_morning', pushMorning);
    await p.setBool('push_evening', pushEvening);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Сохранено')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Настройки')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Часовой пояс'),
          RadioListTile(value: 'auto', groupValue: tzMode, title: const Text('Автоматически'), onChanged: (v) => setState(() => tzMode = v as String)),
          RadioListTile(value: 'manual', groupValue: tzMode, title: const Text('Вручную'), onChanged: (v) => setState(() => tzMode = v as String)),
          const Divider(),

          ListTile(
            title: const Text('Время отбоя'),
            subtitle: Text(sleepTime.format(context)),
            trailing: const Icon(Icons.chevron_right),
            onTap: () async {
              final picked = await showTimePicker(context: context, initialTime: sleepTime);
              if (picked != null) setState(() => sleepTime = picked);
            },
          ),

          SwitchListTile(value: alarmEnabled, onChanged: (v) => setState(() => alarmEnabled = v), title: const Text('Будильник')),
          if (alarmEnabled)
            ListTile(
              title: const Text('Время будильника'),
              subtitle: Text(alarmTime.format(context)),
              trailing: const Icon(Icons.chevron_right),
              onTap: () async {
                final picked = await showTimePicker(context: context, initialTime: alarmTime);
                if (picked != null) setState(() => alarmTime = picked);
              },
            ),

          const Divider(),
          SwitchListTile(value: sounds, onChanged: (v) => setState(() => sounds = v), title: const Text('Звуки')),
          ListTile(
            title: const Text('Тип будильника'),
            subtitle: Text(alarmType == 'soft' ? 'Мягкий' : 'Стандартный'),
            onTap: () => setState(() => alarmType = alarmType == 'soft' ? 'standard' : 'soft'),
          ),
          const Divider(),
          ListTile(
            title: const Text('Язык'),
            subtitle: Text(language == 'ru' ? 'Русский' : 'English'),
            onTap: () => setState(() => language = language == 'ru' ? 'en' : 'ru'),
          ),
          SwitchListTile(value: pushMorning, onChanged: (v) => setState(() => pushMorning = v), title: const Text('Утренние уведомления')),
          SwitchListTile(value: pushEvening, onChanged: (v) => setState(() => pushEvening = v), title: const Text('Вечерние уведомления')),

          const SizedBox(height: 12),
          ElevatedButton(onPressed: _save, child: const Text('Сохранить изменения')),
        ],
      ),
    );
  }
}