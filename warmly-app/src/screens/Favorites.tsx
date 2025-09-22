import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { getFavorites } from '../api/client';

export default function Favorites(_props: NativeStackScreenProps<RootStackParamList, 'Favorites'>) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getFavorites();
      setItems(data);
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 16, borderRadius: 12, backgroundColor: '#fff', marginBottom: 12 }}>
            <Text style={{ fontSize: 16 }}>{item?.phrase?.text || '—'}</Text>
            <Text style={{ marginTop: 6, color: '#888' }}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}