import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '@/components/BigButton';
import { useTemplatesStore } from '@/store/templatesStore';
import { useContactsStore } from '@/store/contactsStore';
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
import type { RootStackParamList } from '@/navigation/RootNavigator';

export function TemplateEditScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'TemplateEdit'>>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const templateId = route.params?.templateId;
  const isEdit = Boolean(templateId);

  const getById = useTemplatesStore((s) => s.getById);
  const add = useTemplatesStore((s) => s.add);
  const update = useTemplatesStore((s) => s.update);
  const remove = useTemplatesStore((s) => s.remove);

  const contacts = useContactsStore((s) => s.contacts);
  const { highContrast, fontScale } = useSettingsStore((s) => s.settings);
  const c = getColors(highContrast);

  const [label, setLabel] = useState('');
  const [body, setBody] = useState('');
  const [includeLocation, setIncludeLocation] = useState(true);
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [labelError, setLabelError] = useState<string | null>(null);
  const [bodyError, setBodyError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (templateId) {
      const existing = getById(templateId);
      if (existing) {
        setLabel(existing.label);
        setBody(existing.body);
        setIncludeLocation(existing.includeLocation);
        setRecipientIds(existing.recipients.map((r) => r.id));
      }
    }
  }, [templateId, getById]);

  const toggleRecipient = (contactId: string) => {
    setRecipientIds((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const validate = (): boolean => {
    let ok = true;
    setLabelError(null);
    setBodyError(null);

    if (label.trim().length < 2) {
      setLabelError('Nazwa szablonu musi mieć co najmniej 2 znaki.');
      ok = false;
    }
    if (body.trim().length < 5) {
      setBodyError('Treść SMS musi mieć co najmniej 5 znaków.');
      ok = false;
    }
    if (body.trim().length > 320) {
      setBodyError('Treść SMS nie może przekraczać 320 znaków.');
      ok = false;
    }
    return ok;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const input = {
        label: label.trim(),
        body: body.trim(),
        includeLocation,
        recipientIds,
      };
      if (isEdit && templateId) {
        await update(templateId, input);
      } else {
        await add(input);
      }
      navigation.goBack();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert('Błąd zapisu', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!templateId) return;
    Alert.alert(
      'Usuń szablon',
      `Czy na pewno chcesz usunąć szablon "${label}"?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(templateId);
              navigation.goBack();
            } catch (e) {
              const msg = e instanceof Error ? e.message : String(e);
              Alert.alert('Błąd usuwania', msg);
            }
          },
        },
      ]
    );
  };

  const labelStyle = {
    fontSize: scaledFont(baseFontSizes.body, fontScale),
    color: c.text,
    fontWeight: '600' as const,
    marginBottom: spacing.xs,
  };

  const inputStyle = {
    fontSize: scaledFont(baseFontSizes.button, fontScale),
    color: c.text,
    backgroundColor: c.surface,
    borderColor: c.border,
    borderWidth: 2,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: TOUCH_TARGET,
  };

  return (
    <SafeAreaView
      edges={['bottom']}
      style={{ flex: 1, backgroundColor: c.background }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            padding: spacing.md,
            gap: spacing.md,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Nazwa */}
          <View>
            <Text style={labelStyle}>Nazwa szablonu</Text>
            <TextInput
              value={label}
              onChangeText={(t) => {
                setLabel(t);
                if (labelError) setLabelError(null);
              }}
              placeholder="np. Potrzebuję pomocy"
              placeholderTextColor={c.textSecondary}
              style={inputStyle}
            />
            {labelError ? (
              <Text style={[styles.error, { color: c.danger }]}>
                {labelError}
              </Text>
            ) : null}
          </View>

          {/* Treść */}
          <View>
            <Text style={labelStyle}>Treść SMS</Text>
            <TextInput
              value={body}
              onChangeText={(t) => {
                setBody(t);
                if (bodyError) setBodyError(null);
              }}
              placeholder="np. Potrzebuję pomocy. Proszę o kontakt."
              placeholderTextColor={c.textSecondary}
              multiline
              style={[
                inputStyle,
                { minHeight: TOUCH_TARGET * 2, textAlignVertical: 'top' },
              ]}
            />
            <Text
              style={{
                fontSize: scaledFont(baseFontSizes.small, fontScale),
                color: c.textSecondary,
                marginTop: spacing.xs,
              }}
            >
              {body.length}/320 znaków
            </Text>
            {bodyError ? (
              <Text style={[styles.error, { color: c.danger }]}>
                {bodyError}
              </Text>
            ) : null}
          </View>

          {/* Dołącz lokalizację */}
          <Pressable
            onPress={() => setIncludeLocation(!includeLocation)}
            style={[
              styles.row,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: includeLocation }}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: c.border,
                  backgroundColor: includeLocation ? c.primary : 'transparent',
                },
              ]}
            >
              {includeLocation ? (
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
              Dołącz lokalizację GPS
            </Text>
          </Pressable>

          {/* Odbiorcy */}
          <View>
            <Text style={labelStyle}>
              Odbiorcy ({recipientIds.length}{' '}
              {recipientIds.length === 1 ? 'wybrany' : 'wybranych'})
            </Text>
            {contacts.length === 0 ? (
              <View
                style={[
                  styles.emptyContacts,
                  { backgroundColor: c.surface, borderColor: c.border },
                ]}
              >
                <Text
                  style={{
                    fontSize: scaledFont(baseFontSizes.body, fontScale),
                    color: c.textSecondary,
                    textAlign: 'center',
                  }}
                >
                  Brak kontaktów. Dodaj kontakty w zakładce Kontakty,
                  aby przypisać ich jako odbiorców.
                </Text>
              </View>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {contacts.map((contact) => {
                  const selected = recipientIds.includes(contact.id);
                  return (
                    <Pressable
                      key={contact.id}
                      onPress={() => toggleRecipient(contact.id)}
                      style={[
                        styles.row,
                        {
                          backgroundColor: selected ? c.primary : c.surface,
                          borderColor: c.border,
                        },
                      ]}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected }}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: selected ? c.primaryText : c.border,
                            backgroundColor: selected
                              ? c.primaryText
                              : 'transparent',
                          },
                        ]}
                      >
                        {selected ? (
                          <Text
                            style={{
                              color: c.primary,
                              fontSize: 20,
                              fontWeight: '900',
                            }}
                          >
                            ✓
                          </Text>
                        ) : null}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: scaledFont(baseFontSizes.body, fontScale),
                            color: selected ? c.primaryText : c.text,
                            fontWeight: '700',
                          }}
                          numberOfLines={1}
                        >
                          {contact.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: scaledFont(baseFontSizes.small, fontScale),
                            color: selected ? c.primaryText : c.textSecondary,
                          }}
                        >
                          {formatPhoneForDisplay(contact.phone)}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* Zapisz */}
          <BigButton
            label={saving ? 'Zapisuję…' : 'ZAPISZ'}
            onPress={handleSave}
          />

          {/* Usuń */}
          {isEdit ? (
            <BigButton label="USUŃ" variant="danger" onPress={handleDelete} />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  error: {
    marginTop: spacing.xs,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 2,
    minHeight: TOUCH_TARGET,
    gap: spacing.md,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContacts: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 2,
  },
});
