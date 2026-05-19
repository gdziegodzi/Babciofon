/**
 * Widget Android "Szybkie dzwonienie" (Babciofon)
 *
 * Pokazuje do 3 ulubionych kontaktów (duże kafle) oraz przycisk ALARM SMS,
 * dostępny bezpośrednio z ekranu głównego telefonu - zgodnie z makietą
 * Ekran Start i tabelą technologii w dokumentacji projektowej (sekcja 2,
 * "Android Widget" - "Szybki dostęp z ekranu głównego (bez szukania ikony),
 * realnie poprawia użyteczność dla seniorów").
 *
 * Renderowanie odbywa się w osobnym procesie (RemoteViews), dlatego można
 * używać wyłącznie prymitywów z react-native-android-widget (FlexWidget,
 * TextWidget) - bez zwykłego View / Text.
 */
import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { Contact } from '@/types/domain';
import { colors } from '@/theme/theme';

export interface QuickCallWidgetProps {
  /** Ulubione kontakty - widget pokazuje maksymalnie 3 (jak ekran Start). */
  favourites: Contact[];
  /** Tryb wysokiego kontrastu (zgodnie z ustawieniami aplikacji). */
  highContrast?: boolean;
}

/** Deep link otwierający ekran Alarm w aplikacji (obsługa w App.tsx / Linking). */
export const ALARM_DEEP_LINK = 'babciofon://alarm';

/** Schemat tel: - otwierany bezpośrednio przez system (dialer). */
const telUri = (phone: string) => `tel:${phone.replace(/\s+/g, '')}`;

export function QuickCallWidget({
  favourites,
  highContrast = false,
}: QuickCallWidgetProps) {
  const c = highContrast ? colors.highContrast : colors.normal;
  const visible = favourites.slice(0, 3);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        backgroundColor: c.background,
        borderRadius: 16,
        padding: 8,
      }}
    >
      {/* Nagłówek widgetu */}
      <TextWidget
        text="Babciofon"
        style={{
          fontSize: 14,
          fontWeight: '700',
          color: c.textSecondary,
          marginBottom: 6,
          marginLeft: 4,
        }}
      />

      {/* Lista ulubionych kontaktów */}
      {visible.length === 0 ? (
        <FlexWidget
          clickAction="OPEN_URI"
          clickActionData={{ uri: ALARM_DEEP_LINK }}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: c.surface,
            borderRadius: 12,
            padding: 12,
          }}
        >
          <TextWidget
            text="Brak ulubionych kontaktów"
            style={{ fontSize: 14, color: c.text, fontWeight: '600' }}
          />
          <TextWidget
            text="Dotknij, aby otworzyć aplikację"
            style={{ fontSize: 12, color: c.textSecondary, marginTop: 4 }}
          />
        </FlexWidget>
      ) : (
        <FlexWidget
          style={{
            flex: 1,
            flexDirection: 'column',
          }}
        >
          {visible.map((contact, idx) => (
            <FlexWidget
              key={contact.id}
              clickAction="OPEN_URI"
              clickActionData={{ uri: telUri(contact.phone) }}
              style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                backgroundColor: c.primary,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginBottom: idx === visible.length - 1 ? 0 : 6,
              }}
            >
              <TextWidget
                text={contact.name}
                maxLines={1}
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: c.primaryText,
                }}
              />
              <TextWidget
                text={contact.phone}
                maxLines={1}
                style={{
                  fontSize: 12,
                  color: c.primaryText,
                  marginTop: 2,
                }}
              />
            </FlexWidget>
          ))}
        </FlexWidget>
      )}

      {/* Przycisk ALARM SMS - prowadzi do ekranu Alarm w aplikacji */}
      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri: ALARM_DEEP_LINK }}
        style={{
          height: 44,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: c.danger,
          borderRadius: 12,
          marginTop: 6,
        }}
      >
        <TextWidget
          text="ALARM SMS"
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: c.dangerText,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
