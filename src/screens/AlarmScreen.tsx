import React from 'react';
import { Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSettingsStore } from '@/store/settingsStore';
import { getColors, scaledFont, baseFontSizes, spacing } from '@/theme/theme';

export function AlarmScreen() {
  const { highContrast, fontScale } = useSettingsStore((s) => s.settings);
  const c = getColors(highContrast);

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
        Alarm SMS
      </Text>
      <Text
        style={{
          fontSize: scaledFont(baseFontSizes.body, fontScale),
          color: c.textSecondary,
        }}
      >
        Moduł alarmów (szablony, lokalizacja, wysyłka) - implementacja w kroku 3.
      </Text>
    </Screen>
  );
}
