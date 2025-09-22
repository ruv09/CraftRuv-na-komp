import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, View, Text, ActivityIndicator, Button } from 'react-native';
import HomeScreen from './src/screens/Home';
import FavoritesScreen from './src/screens/Favorites';
import SendWarmthScreen from './src/screens/SendWarmth';
import { registerDevice } from './src/api/client';

export type RootStackParamList = {
  Home: undefined;
  Favorites: undefined;
  Send: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await registerDevice();
        setReady(true);
      } catch (e: any) {
        setError(e?.message || 'Failed to init');
      }
    })();
  }, []);

  if (!ready) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {error ? (
          <View style={{ gap: 12, alignItems: 'center' }}>
            <Text>Ошибка инициализации: {error}</Text>
            <Button title="Повторить" onPress={() => { setError(null); setReady(false); registerDevice().then(() => setReady(true)).catch((e) => setError(e.message)); }} />
          </View>
        ) : (
          <ActivityIndicator />
        )}
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Warmly' }} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Избранное' }} />
        <Stack.Screen name="Send" component={SendWarmthScreen} options={{ title: 'Отправить тепло' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
