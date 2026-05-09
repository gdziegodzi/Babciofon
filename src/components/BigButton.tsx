import React from 'react';
import { Pressable, Text, StyleSheet, View, ViewStyle } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { getColors, scaledFont, baseFontSizes, spacing, radii, TOUCH_TARGET } from '@/theme/theme';

type Variant = 'primary' | 'danger' | 'surface';

interface BigButtonProps {
  label: string;
  subLabel?: string;
  onPress: () => void;
  variant?: Variant;
  style?: ViewStyle;
  hero?: boolean; // największy przycisk (np. ALARM SMS)
  accessibilityHint?: string;
}

export function BigButton({
  label,
  subLabel,
  onPress,
  variant = 'primary',
  style,
  hero = false,
  accessibilityHint,
}: BigButtonProps) {
  const { highContrast, fontScale } = useSettingsStore((s) => s.settings);
  const c = getColors(highContrast);

  const bg =
    variant === 'danger' ? c.danger : variant === 'surface' ? c.surface : c.primary;
  const fg =
    variant === 'danger'
      ? c.dangerText
      : variant === 'surface'
        ? c.text
        : c.primaryText;

  const fontSize = scaledFont(hero ? baseFontSizes.hero : baseFontSizes.button, fontScale);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          borderColor: c.border,
          minHeight: hero ? TOUCH_TARGET * 1.6 : TOUCH_TARGET,
          opacity: pressed ? 0.75 : 1,
        },
        style,
      ]}
    >
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[styles.label, { color: fg, fontSize }]} numberOfLines={2}>
          {label}
        </Text>
        {subLabel ? (
          <Text
            style={{
              color: fg,
              fontSize: scaledFont(baseFontSizes.small, fontScale),
              marginTop: spacing.xs,
              opacity: 0.9,
            }}
          >
            {subLabel}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
