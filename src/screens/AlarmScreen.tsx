import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

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
import { prepareAlarm, sendAlarmSms } from '@/services/alarmSms';
import type { AlarmTemplate } from '@/types/domain';
import type { TabParamList } from '@/navigation/RootNavigator';

export function AlarmScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const templates = useTemplatesStore((s) => s.templates);
  const { highContrast, fontScale } = useSettingsStore((s) => s.settings);
  const c = getColors(highContrast);

  const [selectedId, setSelectedId] = useState<string | null>(
    templates[0]?.id ?? null
  );
  const [overrideIncludeLocation, setOverrideIncludeLocation] = useState<
    boolean | null
  >(null);
  const [sending, setSending] = useState(false);

  // Auto-select pierwszego szablonu, jeśli nic nie wybrane (np. po imporcie defaults)
  React.useEffect(() => {
    if (!selectedId && templates.length > 0) {
      setSelectedId(templates[0].id);
    }
  }, [templates, selectedId]);

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) ?? null,
    [templates, selectedId]
  );

  // Efektywna wartość includeLocation - z możliwością nadpisania w UI
  const effectiveIncludeLocation =
    overrideIncludeLocation ?? selected?.includeLocation ?? false;

  const handleSend = async () => {
    if (!selected) {
      Alert.alert('Brak szablonu', 'Wybierz szablon alarmu.');
      return;
    }

    if (selected.recipients.length === 0) {
      Alert.alert(
        'Brak odbiorców',
        'Ten szablon nie ma przypisanych odbiorców. Otwórz Ustawienia → Zarządzanie szablonami, aby je dodać.'
      );
      return;
    }

    setSending(true);
    try {
      // Przygotuj alarm - z overridem lokalizacji
      const templateForSend: AlarmTemplate = {
        ...selected,
        includeLocation: effectiveIncludeLocation,
      };

      const prep = await prepareAlarm(templateForSend);

      // Pokaż ostrzeżenia (np. brak GPS, brak uprawnień)
      const proceed = await new Promise<boolean>((resolve) => {
        const recipientsList = prep.recipients
          .map((r) => `• ${r.name} (${r.phone})`)
          .join('\n');
        const warningsText = prep.warnings.length
          ? `\n\nUwagi:\n${prep.warnings.map((w) => `• ${w}`).join('\n')}`
          : '';

        Alert.alert(
          'Wyślij alarm SMS',
          `Treść:\n${prep.body}\n\nOdbiorcy:\n${recipientsList}${warningsText}`,
          [
            { text: 'Anuluj', style: 'cancel', onPress: () => resolve(false) },
            { text: 'WYŚLIJ', style: 'destructive', onPress: () => resolve(true) },
          ]
        );
      });

      if (!proceed) {
        setSending(false);
        return;
      }

      const result = await sendAlarmSms(prep);
      if (result.status === 'sent') {
        Alert.alert('Wysłano', 'Alarm SMS został wysłany.');
      } else if (result.status === 'cancelled') {
        Alert.alert('Anulowano', 'Wysyłka SMS została anulowana.');
      } else {
        Alert.alert(
          'Status nieznany',
          'Nie udało się potwierdzić, czy SMS został wysłany. Sprawdź folder Wysłane w aplikacji SMS.'
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert('Błąd wysyłki', msg);
    } finally {
      setSending(false);
    }
  };

  if (templates.length === 0) {
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
          Brak szablonów alarmowych. Otwórz zakładkę Ustawienia, aby utworzyć
          pierwszy szablon.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text
        style={{
          fontSize: scaledFont(baseFontSizes.title, fontScale),
          color: c.text,
          fontWeight: '700',
          marginBottom: spacing.sm,
        }}
      >
        Alarm SMS
      </Text>

      {/* Wybór szablonu */}
      <Text
        style={{
          fontSize: scaledFont(baseFontSizes.body, fontScale),
          color: c.text,
          fontWeight: '600',
          marginTop: spacing.sm,
        }}
      >
        Wybierz szablon
      </Text>
      <View style={{ gap: spacing.sm }}>
        {templates.map((tpl) => {
          const active = tpl.id === selectedId;
          return (
            <Pressable
              key={tpl.id}
              onPress={() => {
                setSelectedId(tpl.id);
                setOverrideIncludeLocation(null);
              }}
              style={({ pressed }) => [
                styles.tplRow,
                {
                  backgroundColor: active ? c.primary : c.surface,
                  borderColor: c.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={{
                  fontSize: scaledFont(baseFontSizes.button, fontScale),
                  color: active ? c.primaryText : c.text,
                  fontWeight: '700',
                }}
                numberOfLines={1}
              >
                {tpl.label}
              </Text>
              <Text
                style={{
                  fontSize: scaledFont(baseFontSizes.small, fontScale),
                  color: active ? c.primaryText : c.textSecondary,
                  marginTop: 2,
                }}
              >
                {tpl.recipients.length === 0
                  ? 'Brak odbiorców'
                  : `${tpl.recipients.length} ${
                      tpl.recipients.length === 1 ? 'odbiorca' : 'odbiorców'
                    }`}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Podgląd treści */}
      {selected ? (
        <View
          style={[
            styles.preview,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <Text
            style={{
              fontSize: scaledFont(baseFontSizes.small, fontScale),
              color: c.textSecondary,
              marginBottom: spacing.xs,
              fontWeight: '600',
            }}
          >
            Podgląd treści:
          </Text>
          <Text
            style={{
              fontSize: scaledFont(baseFontSizes.body, fontScale),
              color: c.text,
            }}
          >
            {selected.body}
          </Text>
          {effectiveIncludeLocation ? (
            <Text
              style={{
                fontSize: scaledFont(baseFontSizes.small, fontScale),
                color: c.textSecondary,
                marginTop: spacing.xs,
                fontStyle: 'italic',
              }}
            >
              + lokalizacja zostanie dołączona przy wysyłce
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* Toggle lokalizacji */}
      {selected ? (
        <Pressable
          onPress={() =>
            setOverrideIncludeLocation(!effectiveIncludeLocation)
          }
          style={[
            styles.locRow,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: effectiveIncludeLocation }}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: c.border,
                backgroundColor: effectiveIncludeLocation
                  ? c.primary
                  : 'transparent',
              },
            ]}
          >
            {effectiveIncludeLocation ? (
              <Text style={{ color: c.primaryText, fontSize: 20, fontWeight: '900' }}>
                ✓
              </Text>
            ) : null}
          </View>
          <Text
            style={{
              fontSize: scaledFont(baseFontSizes.body, fontScale),
              color: c.text,
              flex: 1,
            }}
          >
            Dołącz moją lokalizację
          </Text>
        </Pressable>
      ) : null}

      {/* Wyślij */}
      <View style={{ marginTop: spacing.md }}>
        <BigButton
          label={sending ? 'Wysyłam…' : 'WYŚLIJ ALARM'}
          variant="danger"
          hero
          onPress={handleSend}
        />
      </View>

      {sending ? (
        <ActivityIndicator size="large" color={c.primary} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tplRow: {
    minHeight: TOUCH_TARGET,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 2,
    justifyContent: 'center',
  },
  preview: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 2,
    marginTop: spacing.sm,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 2,
    minHeight: TOUCH_TARGET,
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});