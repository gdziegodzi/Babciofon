/**
 * Pomocnik do odświeżania widgetu Android z poziomu aplikacji.
 *
 * Używany przez store'y (kontakty, ustawienia), aby widget na ekranie
 * głównym zawsze pokazywał aktualne ulubione kontakty i właściwy motyw.
 *
 * Funkcja jest no-opem poza Androidem, a wszystkie błędy są wyciszone -
 * brak widgetu na ekranie głównym to typowy scenariusz, nie błąd.
 */
import React from 'react';
import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { contactsRepository } from '@/repositories/contactsRepository';
import { QuickCallWidget } from '@/widgets/QuickCallWidget';

const WIDGET_NAME = 'QuickCall';

/**
 * Prosi system o ponowne wyrenderowanie widgetu QuickCall.
 *
 * Wykonuje świeże zapytanie do bazy zamiast polegać na stanie w Zustand,
 * dzięki czemu można wołać tę funkcję zaraz po zapisie, bez ryzyka
 * pokazania nieaktualnych danych.
 *
 * @param highContrast aktualne ustawienie kontrastu w aplikacji
 */
export async function refreshQuickCallWidget(
  highContrast: boolean
): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    const all = await contactsRepository.getAll();
    const favourites = all.filter((k) => k.isFavourite).slice(0, 3);

    await requestWidgetUpdate({
      widgetName: WIDGET_NAME,
      renderWidget: () => (
        <QuickCallWidget
          favourites={favourites}
          highContrast={highContrast}
        />
      ),
      widgetNotFound: () => {
        // Użytkownik nie dodał widgetu na ekran główny - to nie jest błąd.
      },
    });
  } catch (e) {
    // Moduł natywny może być niedostępny w trybie dev bez prebuildu.
    if (__DEV__) {
      console.warn('[Widget] refresh failed:', e);
    }
  }
}
