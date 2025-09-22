import 'dart:math';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class MoodScreen extends StatefulWidget {
  const MoodScreen({super.key});

  @override
  State<MoodScreen> createState() => _MoodScreenState();
}

class _MoodScreenState extends State<MoodScreen> {
  String? mood; // good | ok | bad
  String? phrase;

  Future<void> _saveFavorite(String text) async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList('favorites') ?? [];
    list.add('${DateTime.now().toIso8601String()}|$text');
    await prefs.setStringList('favorites', list);
    if (mounted) Navigator.pop(context);
  }

  void pickPhrase(String m) {
    final pool = m == 'good' ? _phrasesGood : (m == 'ok' ? _phrasesOk : _phrasesBad);
    setState(() {
      mood = m;
      phrase = pool[Random().nextInt(pool.length)];
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Как ты себя чувствуешь?')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Wrap(
              spacing: 12,
              children: [
                ChoiceChip(label: const Text('😊 Хорошо'), selected: mood=='good', onSelected: (_) => pickPhrase('good')),
                ChoiceChip(label: const Text('😐 Нормально'), selected: mood=='ok', onSelected: (_) => pickPhrase('ok')),
                ChoiceChip(label: const Text('😞 Плохо'), selected: mood=='bad', onSelected: (_) => pickPhrase('bad')),
              ],
            ),
            const SizedBox(height: 16),
            if (phrase != null)
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                  child: Center(
                    child: Text(phrase!, textAlign: TextAlign.center, style: const TextStyle(fontSize: 20, fontStyle: FontStyle.italic)),
                  ),
                ),
              ),
            const SizedBox(height: 16),
            if (phrase != null)
              ElevatedButton(onPressed: () => _saveFavorite(phrase!), child: const Text('Сохранить в архив ❤️')),
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Пропустить')),
          ],
        ),
      ),
    );
  }
}

const _phrasesGood = [
  'Сохрани это ощущение — оно твоё.',
  'Поделись теплом с собой будущим.',
  'Пусть этот день будет мягким и ясным.',
];

const _phrasesOk = [
  'Нормально — это тоже нормально.',
  'Шаг за шагом. Ты справишься.',
  'Сделай мягкий вдох. Этого достаточно.',
];

const _phrasesBad = [
  'Если тяжело — это не навсегда. Ты не один.',
  'Можно опереться на себя. Тихо и бережно.',
  'Ты ценен даже в самые тяжёлые дни.',
];