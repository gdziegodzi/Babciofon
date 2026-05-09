import React from 'react';
import { Text, View, Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Screen } from '@/components/Screen';
import { BigButton } from '@/components/BigButton';
import { useContactsStore } from '@/store/contactsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { getColors, scaledFont, baseFontSizes, spacing } from '@/theme/theme';
import type { TabParamList } from '@/navigation/RootNavigator';

export function StartScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const contacts = useContactsStore((s) => s.contacts);
  const { highContrast, fontScale } = useSettingsStore((s) => s.settings);
  const c = getColors(highContrast);

  // Ulubione kontakty (max 3 - zgodnie z makietą Ekran Start)
  const favourites = contacts.filter((k) => k.isFavourite).slice(0, 3);

  const handleCall = async (phone: string, name: string) => {
    const url = `tel:${phone.replace(/\s+/g, '')}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Nie można zadzwonić', `Numer: ${phone}`);
      return;
    }
    await Linking.openURL(url);
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
        Babciofon
      </Text>

      {favourites.length === 0 ? (
        <View style={{ padding: spacing.lg }}>
          <Text
            style={{
              fontSize: scaledFont(baseFontSizes.body, fontScale),
              color: c.textSecondary,
              textAlign: 'center',
              marginBottom: spacing.md,
            }}
          >
            Brak ulubionych kontaktów. Dodaj je w zakładce Kontakty.
          </Text>
          <BigButton
            label="Przejdź do Kontaktów"
            variant="surface"
            onPress={() => navigation.navigate('Kontakty')}
          />
        </View>
      ) : (
        favourites.map((contact) => (
          <BigButton
            key={contact.id}
            label={contact.name}
            subLabel={contact.phone}
            onPress={() => handleCall(contact.phone, contact.name)}
            accessibilityHint={`Zadzwoń do ${contact.name}`}
          />
        ))
      )}

      <View style={{ marginTop: spacing.lg }}>
        <BigButton
          label="ALARM SMS"
          variant="danger"
          hero
          onPress={() => navigation.navigate('Alarm')}
          accessibilityHint="Otwórz ekran wysyłania alarmu SMS"
        />
      </View>
    </Screen>
  );
}
