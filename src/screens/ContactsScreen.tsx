import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '@/components/Screen';
import { BigButton } from '@/components/BigButton';
import { ContactCard } from '@/components/ContactCard';
import { useContactsStore } from '@/store/contactsStore';
import { useSettingsStore } from '@/store/settingsStore';
import {
  getColors,
  scaledFont,
  baseFontSizes,
  spacing,
} from '@/theme/theme';
import {
  loadDeviceContacts,
  deviceContactsToInputs,
  ContactsPermissionError,
} from '@/services/contactsImport';
import type { RootStackParamList } from '@/navigation/RootNavigator';

export function ContactsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const contacts = useContactsStore((s) => s.contacts);
  const toggleFavourite = useContactsStore((s) => s.toggleFavourite);
  const importBatch = useContactsStore((s) => s.importBatch);
  const { highContrast, fontScale } = useSettingsStore((s) => s.settings);
  const c = getColors(highContrast);

  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    setImporting(true);
    try {
      const deviceContacts = await loadDeviceContacts();
      if (deviceContacts.length === 0) {
        Alert.alert(
          'Brak kontaktów',
          'W książce telefonicznej nie znaleziono kontaktów z poprawnymi numerami.'
        );
        return;
      }

      Alert.alert(
        'Import kontaktów',
        `Znaleziono ${deviceContacts.length} kontaktów do zaimportowania. Kontynuować?`,
        [
          { text: 'Anuluj', style: 'cancel' },
          {
            text: 'Importuj',
            onPress: async () => {
              try {
                const inputs = deviceContactsToInputs(deviceContacts);
                const result = await importBatch(inputs);
                Alert.alert(
                  'Import zakończony',
                  `Dodano: ${result.added}\nPominięto (już istnieją): ${result.skipped}`
                );
              } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                Alert.alert('Błąd importu', msg);
              }
            },
          },
        ]
      );
    } catch (e) {
      if (e instanceof ContactsPermissionError) {
        Alert.alert(
          'Brak uprawnień',
          'Aby zaimportować kontakty, musisz przyznać aplikacji dostęp do książki telefonicznej. Możesz to zrobić w Ustawieniach systemu Android.'
        );
      } else {
        const msg = e instanceof Error ? e.message : String(e);
        Alert.alert('Błąd', msg);
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <Screen>
      <Text
        style={{
          fontSize: scaledFont(baseFontSizes.title, fontScale),
          color: c.text,
          fontWeight: '700',
          marginBottom: spacing.md,
        }}
      >
        Kontakty
      </Text>

      <BigButton
        label="+ Dodaj kontakt"
        onPress={() => navigation.navigate('ContactEdit', {})}
      />

      <BigButton
        label={importing ? 'Importuję…' : 'Importuj z książki telefonicznej'}
        variant="surface"
        onPress={handleImport}
      />

      {importing ? (
        <ActivityIndicator size="large" color={c.primary} />
      ) : null}

      {contacts.length === 0 ? (
        <View style={styles.empty}>
          <Text
            style={{
              fontSize: scaledFont(baseFontSizes.body, fontScale),
              color: c.textSecondary,
              textAlign: 'center',
            }}
          >
            Brak zapisanych kontaktów. Dodaj pierwszy kontakt, korzystając
            z przycisków powyżej.
          </Text>
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onPress={() =>
                navigation.navigate('ContactEdit', { contactId: contact.id })
              }
              onToggleFavourite={() => toggleFavourite(contact.id)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
});
