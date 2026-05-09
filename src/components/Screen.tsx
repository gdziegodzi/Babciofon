import React from 'react';
import { ScrollView, View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '@/store/settingsStore';
import { getColors, spacing } from '@/theme/theme';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}

export function Screen({ children, scroll = true, style }: ScreenProps) {
  const highContrast = useSettingsStore((s) => s.settings.highContrast);
  const c = getColors(highContrast);

  const Container = scroll ? ScrollView : View;

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: c.background }]}>
      <Container
        style={[styles.container, { backgroundColor: c.background }, style]}
        contentContainerStyle={scroll ? styles.scrollContent : undefined}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: spacing.md },
  scrollContent: { paddingVertical: spacing.md, gap: spacing.md },
});
