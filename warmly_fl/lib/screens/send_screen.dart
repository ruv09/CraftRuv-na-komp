import 'dart:math';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

class SendScreen extends StatefulWidget {
  const SendScreen({super.key});

  @override
  State<SendScreen> createState() => _SendScreenState();
}

class _SendScreenState extends State<SendScreen> {
  late List<String> pool;
  @override
  void initState() {
    super.initState();
    pool = List.of(_friendPhrases)..shuffle(Random());
  }

  void sharePhrase(String text) {
    final message = 'Тебе прислали тёплое слово ❤️\n"$text"\n— via Warmly';
    Share.share(message);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Поделись теплом')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: min(5, pool.length),
        itemBuilder: (context, i) {
          final text = pool[i];
          return Card(
            child: ListTile(
              title: Text(text),
              trailing: TextButton(onPressed: () => sharePhrase(text), child: const Text('Отправить')), 
            ),
          );
        },
      ),
    );
  }
}

const _friendPhrases = [
  'Ты важен. Даже если сейчас так не кажется.',
  'Пусть этот день будет мягче к тебе.',
  'Ты делаешь больше, чем думаешь.',
  'Береги себя. Ты достоин заботы.',
  'Если тяжело — можно быть неидеальным.',
];