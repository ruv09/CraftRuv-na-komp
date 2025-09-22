import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { getPhrases, addFavorite, Phrase } from '../api/client';

export default function Home({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const [loading, setLoading] = useState(true);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getPhrases({ lang: 'ru', limit: 10 });
      setPhrases(data);
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
        <Button title="Обновить" onPress={load} />
        <Button title="Избранное" onPress={() => navigation.navigate('Favorites')} />
        <Button title="Отправить" onPress={() => navigation.navigate('Send')} />
      </View>
      <FlatList
        data={phrases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 16, borderRadius: 12, backgroundColor: '#fff', marginBottom: 12 }}>
            <Text style={{ fontSize: 16 }}>{item.text}</Text>
            <View style={{ marginTop: 8 }}>
              <TouchableOpacity onPress={() => addFavorite(item.id)}>
                <Text style={{ color: '#6200EE' }}>Добавить в избранное</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}