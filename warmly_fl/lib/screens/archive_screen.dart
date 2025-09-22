import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:share_plus/share_plus.dart';

class ArchiveScreen extends StatefulWidget {
  const ArchiveScreen({super.key});

  @override
  State<ArchiveScreen> createState() => _ArchiveScreenState();
}

class _ArchiveScreenState extends State<ArchiveScreen> {
  List<String> items = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() => items = (prefs.getStringList('favorites') ?? []).reversed.toList());
  }

  Future<void> _remove(int index) async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList('favorites') ?? [];
    final realIndex = list.length - 1 - index;
    list.removeAt(realIndex);
    await prefs.setStringList('favorites', list);
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Мои тёплые слова')),
      body: items.isEmpty
          ? const Center(child: Text('Здесь будут жить твои любимые фразы. Нажми ❤️, чтобы сохранить.'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              itemBuilder: (context, i) {
                final parts = items[i].split('|');
                final text = parts.length > 1 ? parts[1] : items[i];
                final date = parts.isNotEmpty ? DateTime.tryParse(parts[0]) : null;
                return Card(
                  child: ListTile(
                    title: Text(text),
                    subtitle: Text(date?.toLocal().toString() ?? ''),
                    trailing: Wrap(spacing: 8, children: [
                      IconButton(icon: const Icon(Icons.share), onPressed: () => Share.share(text)),
                      IconButton(icon: const Icon(Icons.favorite), onPressed: () => _remove(i)),
                    ]),
                  ),
                );
              },
            ),
    );
  }
}