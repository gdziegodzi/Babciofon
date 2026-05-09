import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import {
  getColors,
  scaledFont,
  baseFontSizes,
  spacing,
  radii,
  TOUCH_TARGET,
} from '@/theme/theme';
import { formatPhoneForDisplay } from '@/utils/phone';
import type { Contact } from '@/types/domain';

interface ContactCardProps {
  contact: Contact;
  onPress: () => void;
  onToggleFavourite?: () => void;
}

export function ContactCard({
  contact,
  onPress,
  onToggleFavourite,
}: ContactCardProps) {
  const { highContrast, fontScale } = useSettingsStore((s) => s.settings);
  const c = getColors(highContrast);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: c.surface,
          borderColor: c.border,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Edytuj kontakt ${contact.name}`}
        style={({ pressed }) => [styles.main, { opacity: pressed ? 0.6 : 1 }]}
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
          {contact.name}
        </Text>
        <Text
          style={{
            fontSize: scaledFont(baseFontSizes.body, fontScale),
            color: c.textSecondary,
          }}
        >
          {formatPhoneForDisplay(contact.phone)}
        </Text>
      </Pressable>

      {onToggleFavourite ? (
        <Pressable
          onPress={onToggleFavourite}
          accessibilityRole="button"
          accessibilityLabel={
            contact.isFavourite
              ? `Usuń ${contact.name} z ulubionych`
              : `Dodaj ${contact.name} do ulubionych`
          }
          style={({ pressed }) => [
            styles.starBtn,
            { borderLeftColor: c.border, opacity: pressed ? 0.5 : 1 },
          ]}
        >
          <Text
            style={{
              fontSize: scaledFont(baseFontSizes.title, fontScale),
              color: contact.isFavourite ? c.primary : c.textSecondary,
            }}
          >
            {contact.isFavourite ? '★' : '☆'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    minHeight: TOUCH_TARGET + 16,
    borderRadius: radii.lg,
    borderWidth: 2,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
  starBtn: {
    width: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
  },
});
