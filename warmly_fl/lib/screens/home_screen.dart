import 'dart:math';
import 'package:flutter/material.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String phrase = '';

  @override
  void initState() {
    super.initState();
    _loadPhrase();
  }

  void _loadPhrase() {
    final now = TimeOfDay.now();
    final isMorning = now.hour >= 5 && now.hour < 12;
    final isEvening = now.hour >= 20 || now.hour < 5;
    final parts = isMorning
        ? _phrasesMorning
        : (isEvening ? _phrasesEvening : _phrasesDay);
    setState(() => phrase = parts[Random().nextInt(parts.length)]);
  }

  String _greeting() {
    final h = TimeOfDay.now().hour;
    if (h >= 5 && h < 12) return 'Доброе утро 🌞';
    if (h >= 20 || h < 5) return 'Спокойной ночи 🌙';
    return 'Тёплого дня ✨';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Warmly'), centerTitle: true),
      bottomNavigationBar: BottomNavigationBar(
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Домой'),
          BottomNavigationBarItem(icon: Icon(Icons.favorite), label: 'Архив'),
          BottomNavigationBarItem(icon: Icon(Icons.settings), label: 'Настройки'),
        ],
        currentIndex: 0,
        onTap: (i) {
          if (i == 1) Navigator.pushNamed(context, '/archive');
          if (i == 2) Navigator.pushNamed(context, '/settings');
        },
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(_greeting(), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600)),
            const SizedBox(height: 16),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Center(
                  child: Text(
                    phrase,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 20, fontStyle: FontStyle.italic),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => Navigator.pushNamed(context, '/mood'),
              child: const Text('Как ты? 😊 😐 😞'),
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: () => Navigator.pushNamed(context, '/send'),
              child: const Text('Поделиться теплом 💌'),
            ),
          ],
        ),
      ),
    );
  }
}

const _phrasesMorning = [
  'Сегодня можно идти мягко. Ты не обязан спешить.',
  'Ты уже сделал главное — проснулся. Это достаточно.',
  'Доброе утро. Твоя ценность не зависит от достижений.',
];

const _phrasesDay = [
  'Сделай вдох. Ты имеешь право на паузу.',
  'Если тяжело — это нормально. Ты не один.',
  'Ты достаточно хорош просто тем, что есть.',
];

const _phrasesEvening = [
  'Сегодня ты сделал достаточно. Отдых — тоже достижение.',
  'Спасибо себе за этот день. Ты справился.',
  'Ночь — чтобы мягко отпустить. Спокойной тебе тишины.',
];