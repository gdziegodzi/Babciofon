import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, View, Text } from 'react-native';
import { initDatabase } from '@/db/database';
import { useSettingsStore } from '@/store/settingsStore';
import { useContactsStore } from '@/store/contactsStore';
import { useTemplatesStore } from '@/store/templatesStore';
import { RootNavigator } from '@/navigation/RootNavigator';
import { getColors } from '@/theme/theme';

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useSettingsStore((s) => s.load);
  const highContrast = useSettingsStore((s) => s.settings.highContrast);
  const loadContacts = useContactsStore((s) => s.load);
  const loadTemplates = useTemplatesStore((s) => s.load);
  const seedTemplates = useTemplatesStore((s) => s.seedDefaultsIfEmpty);

  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
        await Promise.all([loadSettings(), loadContacts(), loadTemplates()]);
        await seedTemplates();
        setReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, [loadSettings, loadContacts, loadTemplates, seedTemplates]);

  const c = getColors(highContrast);

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: c.background }}>
        <Text style={{ color: c.danger, fontSize: 20, textAlign: 'center' }}>
          Błąd inicjalizacji: {error}
        </Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={highContrast ? 'light' : 'dark'} />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}