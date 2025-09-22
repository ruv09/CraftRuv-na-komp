import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  StorageService._();

  static Future<SharedPreferences> _prefs() => SharedPreferences.getInstance();

  static Future<bool> getSeenOnboarding() async => (await _prefs()).getBool('seen_onboarding') ?? false;
  static Future<void> setSeenOnboarding(bool v) async => (await _prefs()).setBool('seen_onboarding', v);

  static Future<String> getLanguage() async => (await _prefs()).getString('lang') ?? 'ru';
  static Future<void> setLanguage(String v) async => (await _prefs()).setString('lang', v);

  static Future<List<String>> getFavorites() async => (await _prefs()).getStringList('favorites') ?? <String>[];
  static Future<void> setFavorites(List<String> v) async => (await _prefs()).setStringList('favorites', v);
}