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
import {
  toCanonicalPhone,
  isValidPhone,
  formatPhoneForDisplay,
} from '@/utils/phone';
import { DuplicatePhoneError } from '@/repositories/contactsRepository';
import type { RootStackParamList } from '@/navigation/RootNavigator';

export function ContactEditScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ContactEdit'>>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const contactId = route.params?.contactId;
  const isEdit = Boolean(contactId);

  const getById = useContactsStore((s) => s.getById);
  const add = useContactsStore((s) => s.add);
  const update = useContactsStore((s) => s.update);
  const remove = useContactsStore((s) => s.remove);

  const { highContrast, fontScale } = useSettingsStore((s) => s.settings);
  const c = getColors(highContrast);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isFavourite, setIsFavourite] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Wczytanie istniejącego kontaktu
  useEffect(() => {
    if (contactId) {
      const existing = getById(contactId);
      if (existing) {
        setName(existing.name);
        setPhone(formatPhoneForDisplay(existing.phone));
        setIsFavourite(existing.isFavourite);
      }
    }
  }, [contactId, getById]);

  const validate = (): boolean => {
    let ok = true;
    setNameError(null);
    setPhoneError(null);

    if (name.trim().length < 2) {
      setNameError('Imię musi mieć co najmniej 2 znaki.');
      ok = false;
    }
    const canonical = toCanonicalPhone(phone);
    if (!isValidPhone(canonical)) {
      setPhoneError('Numer telefonu jest niepoprawny.');
      ok = false;
    }
    return ok;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const input = {
        name: name.trim(),
        phone: toCanonicalPhone(phone),
        isFavourite,
      };
      if (isEdit && contactId) {
        await update(contactId, input);
      } else {
        await add(input);
      }
      navigation.goBack();
    } catch (e) {
      if (e instanceof DuplicatePhoneError) {
        setPhoneError('Kontakt z tym numerem już istnieje.');
      } else {
        const msg = e instanceof Error ? e.message : String(e);
        Alert.alert('Błąd zapisu', msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!contactId) return;
    Alert.alert(
      'Usuń kontakt',
      `Czy na pewno chcesz usunąć kontakt "${name}"?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(contactId);
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
          {/* Imię */}
          <View>
            <Text style={labelStyle}>Imię i nazwisko</Text>
            <TextInput
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (nameError) setNameError(null);
              }}
              placeholder="np. Anna Kowalska"
              placeholderTextColor={c.textSecondary}
              autoCapitalize="words"
              style={inputStyle}
            />
            {nameError ? (
              <Text style={[styles.error, { color: c.danger }]}>
                {nameError}
              </Text>
            ) : null}
          </View>

          {/* Telefon */}
          <View>
            <Text style={labelStyle}>Numer telefonu</Text>
            <TextInput
              value={phone}
              onChangeText={(t) => {
                setPhone(t);
                if (phoneError) setPhoneError(null);
              }}
              placeholder="np. 123 456 789 lub +48 123 456 789"
              placeholderTextColor={c.textSecondary}
              keyboardType="phone-pad"
              style={inputStyle}
            />
            {phoneError ? (
              <Text style={[styles.error, { color: c.danger }]}>
                {phoneError}
              </Text>
            ) : null}
          </View>

          {/* Ulubiony */}
          <Pressable
            onPress={() => setIsFavourite(!isFavourite)}
            style={[
              styles.favRow,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isFavourite }}
            accessibilityLabel="Ulubiony - wyświetlany na ekranie startowym"
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: c.border,
                  backgroundColor: isFavourite ? c.primary : 'transparent',
                },
              ]}
            >
              {isFavourite ? (
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
              Ulubiony (na ekranie startowym)
            </Text>
          </Pressable>

          {/* Zapisz */}
          <BigButton
            label={saving ? 'Zapisuję…' : 'ZAPISZ'}
            onPress={handleSave}
          />

          {/* Usuń (tylko w edycji) */}
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
  favRow: {
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
});
