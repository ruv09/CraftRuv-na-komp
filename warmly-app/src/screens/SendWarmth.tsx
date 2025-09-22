import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { sendWarmth } from '../api/client';

export default function SendWarmth(_props: NativeStackScreenProps<RootStackParamList, 'Send'>) {
  const [text, setText] = useState('Ты достаточно хорош. Сделай мягкий вдох.');
  const [fromName, setFromName] = useState('');
  const [toAlias, setToAlias] = useState('');
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await sendWarmth({ text: text.trim(), fromName: fromName || undefined, toAlias: toAlias || undefined });
      Alert.alert('Отправлено', 'Тёплое слово отправлено.');
      setText('');
      setFromName('');
      setToAlias('');
    } catch (e: any) {
      Alert.alert('Ошибка', e?.message || 'Не удалось отправить');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text>Фраза</Text>
      <TextInput value={text} onChangeText={setText} multiline style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, minHeight: 120 }} />

      <Text>От кого (необязательно)</Text>
      <TextInput value={fromName} onChangeText={setFromName} style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8 }} />

      <Text>Кому (необязательно)</Text>
      <TextInput value={toAlias} onChangeText={setToAlias} style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8 }} />

      <Button title={loading ? 'Отправка...' : 'Отправить'} onPress={onSend} disabled={loading} />
    </View>
  );
}