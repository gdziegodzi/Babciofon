# Babciofon

Aplikacja telefoniczna dla seniorów - duże przyciski, szybkie dzwonienie, alarm SMS z lokalizacją.

## Stack

- **Expo SDK 52** + **React Native 0.76** (New Architecture)
- **TypeScript** (strict mode)
- **React Navigation 7** (bottom tabs + native stack)
- **Zustand 4** (globalny stan)
- **expo-sqlite** (lokalna baza danych)
- **expo-contacts** / **expo-location** / **expo-sms**

## Wymagania

- Node.js 20+
- JDK 17
- Android Studio + Android SDK (API 34+)
- Urządzenie/emulator Android

## Pierwsze uruchomienie

```bash
# 1. Instalacja zależności
npm install

# 2. Prebuild - generuje folder android/
#    Wymagane, bo używamy modułów natywnych (SMS, Widget),
#    które nie są dostępne w Expo Go.
npx expo prebuild --clean

# 3. Uruchomienie na podłączonym Androidzie / emulatorze
npm run android
```

## Po prebuildzie

Aplikacja działa jako **dev client** - nie używa Expo Go.
Po pierwszym `expo run:android` możesz dalej iterować przez:

```bash
npm start          # uruchamia Metro bundler
# i wybierasz dev clienta na telefonie
```

## Struktura projektu

```
src/
├── components/       # BigButton, Screen - komponenty współdzielone
├── db/              # SQLite - schemat i dostęp
├── navigation/      # React Navigation
├── screens/         # Ekrany aplikacji (Start, Kontakty, Alarm, Ustawienia)
├── services/        # Integracje (połączenia, SMS, lokalizacja, kontakty)
├── store/           # Zustand stores
├── theme/           # Kolory, typografia, dostępność
├── types/           # Typy domenowe (Contact, AlarmTemplate, Settings)
└── utils/           # Funkcje pomocnicze
```

## Status implementacji

Zgodnie z planem Trello:

- [x] Inicjalizacja projektu React Native
- [x] Konfiguracja React Navigation
- [x] Konfiguracja Zustand
- [x] Konfiguracja SQLite (schemat + init)
- [x] Ekran Ustawień (kontrast + rozmiar fontu)
- [ ] Moduł Kontaktów (CRUD + import z książki)  *(krok 2)*
- [ ] Moduł Alarmów (szablony + lokalizacja + wysyłka SMS) *(krok 3)*
- [ ] Moduł Połączeń (Linking + widget Android) *(krok 4)*
- [ ] Testy *(krok 5)*

## Uwagi techniczne

- **Wysyłka SMS:** użyjemy `expo-sms` (otwiera natywny komponent SMS z uzupełnioną treścią - bezpieczniejszy wariant zgodny z dokumentacją).
- **Połączenia:** `Linking.openURL('tel:...')` - otwiera dialer z numerem.
- **Lokalizacja:** `expo-location` z fallbackiem na ostatnią znaną pozycję, gdy GPS niedostępny.
- **Widget Android:** wymaga `react-native-android-widget` - implementacja w kroku 4.
