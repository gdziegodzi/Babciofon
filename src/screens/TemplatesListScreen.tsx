import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '@/components/Screen';
import { BigButton } from '@/components/BigButton';
import { useTemplatesStore } from '@/store/templatesStore';
import { useSettingsStore } from '@/store/settingsStore';
import {
  getColors,
  scaledFont,
  baseFontSizes,
  spacing,
  radii,
  TOUCH_TARGET,
} from '@/theme/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';

export function TemplatesListScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const templates = useTemplatesStore((s) => s.templates);
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
        Szablony alarmów
      </Text>

      <BigButton
        label="+ Dodaj szablon"
        onPress={() => navigation.navigate('TemplateEdit', {})}
      />

      {templates.length === 0 ? (
        <View style={{ padding: spacing.lg }}>
          <Text
            style={{
              fontSize: scaledFont(baseFontSizes.body, fontScale),
              color: c.textSecondary,
              textAlign: 'center',
            }}
          >
            Brak szablonów. Dodaj pierwszy szablon przyciskiem powyżej.
          </Text>
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
          {templates.map((tpl) => (
            <Pressable
              key={tpl.id}
              onPress={() =>
                navigation.navigate('TemplateEdit', { templateId: tpl.id })
              }
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: c.surface,
                  borderColor: c.border,
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Edytuj szablon ${tpl.label}`}
            >
              <Text
                style={{
                  fontSize: scaledFont(baseFontSizes.button, fontScale),
                  color: c.text,
                  fontWeight: '700',
                  marginBottom: spacing.xs,
                }}
                numberOfLines={1}
              >
                {tpl.label}
              </Text>
              <Text
                style={{
                  fontSize: scaledFont(baseFontSizes.small, fontScale),
                  color: c.textSecondary,
                }}
                numberOfLines={2}
              >
                {tpl.body}
              </Text>
              <Text
                style={{
                  fontSize: scaledFont(baseFontSizes.small, fontScale),
                  color: c.textSecondary,
                  marginTop: spacing.xs,
                  fontStyle: 'italic',
                }}
              >
                {tpl.recipients.length === 0
                  ? 'Brak odbiorców'
                  : `Odbiorcy: ${tpl.recipients.map((r) => r.name).join(', ')}`}
                {tpl.includeLocation ? ' • +GPS' : ''}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: TOUCH_TARGET,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 2,
    justifyContent: 'center',
  },
});
