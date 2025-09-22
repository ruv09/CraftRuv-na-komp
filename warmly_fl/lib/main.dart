import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Warmly',
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFFF5EE), // кремовый фон
        fontFamily: 'Nunito',
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Warmly", style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFFE67E6B), // терракот
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
