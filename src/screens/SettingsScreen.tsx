import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '@/components/Screen';
import { BigButton } from '@/components/BigButton';
import { useSettingsStore } from '@/store/settingsStore';
import {
  getColors,
  scaledFont,
  baseFontSizes,
  spacing,
  radii,
} from '@/theme/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';

const FONT_PRESETS: Array<{ label: string; value: number }> = [
  { label: 'Mały', value: 0.9 },
  { label: 'Normalny', value: 1.0 },
  { label: 'Duży', value: 1.2 },
  { label: 'Bardzo duży', value: 1.5 },
];

export function SettingsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);
  const reset = useSettingsStore((s) => s.reset);
  const c = getColors(settings.highContrast);

  return (
    <Screen>
      <Text
        style={{
          fontSize: scaledFont(baseFontSizes.title, settings.fontScale),
          color: c.text,
          fontWeight: '700',
          marginBottom: spacing.md,
        }}
      >
        Ustawienia
      </Text>

      {/* Wysoki kontrast */}
      <View
        style={[
          styles.row,
          { backgroundColor: c.surface, borderColor: c.border },
        ]}
      >
        <Text
          style={{
            fontSize: scaledFont(baseFontSizes.body, settings.fontScale),
            color: c.text,
            flex: 1,
          }}
        >
          Wysoki kontrast
        </Text>
        <Switch
          value={settings.highContrast}
          onValueChange={(v) => update({ highContrast: v })}
          accessibilityLabel="Wysoki kontrast"
        />
      </View>

      {/* Rozmiar tekstu */}
      <View
        style={[
          styles.section,
          { backgroundColor: c.surface, borderColor: c.border },
        ]}
      >
        <Text
          style={{
            fontSize: scaledFont(baseFontSizes.body, settings.fontScale),
            color: c.text,
            marginBottom: spacing.sm,
          }}
        >
          Rozmiar tekstu
        </Text>
        <View style={styles.presetRow}>
          {FONT_PRESETS.map((p) => {
            const active = Math.abs(settings.fontScale - p.value) < 0.01;
            return (
              <BigButton
                key={p.value}
                label={p.label}
                variant={active ? 'primary' : 'surface'}
                onPress={() => update({ fontScale: p.value })}
                style={{ flexGrow: 1, flexBasis: '45%' }}
              />
            );
          })}
        </View>
      </View>

      {/* Zarządzanie szablonami */}
      <BigButton
        label="Zarządzaj szablonami alarmów"
        variant="surface"
        onPress={() => navigation.navigate('TemplatesList')}
      />

      {/* Reset */}
      <BigButton label="Przywróć domyślne" variant="surface" onPress={reset} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});