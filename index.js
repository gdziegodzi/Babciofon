/**
 * Główny entry point aplikacji Babciofon.
 *
 * Rejestruje:
 *  - główny komponent aplikacji (App.tsx),
 *  - task handler widgetu Android (background/headless proces RN, który
 *    odpowiada za rysowanie widgetu i reakcje na zdarzenia cyklu życia).
 *
 * Plik celowo trzymamy jako `.js` (a nie `.ts`), bo `resolveAppEntry.js`
 * z Expo SDK 52 ma problem ze ścieżką do entry z rozszerzeniem TS i
 * generuje wtedy pusty string, co wywala build Gradle z komunikatem
 * "path may not be null or empty string" - patrz expo/expo#22584.
 *
 * TypeScript siedzi w `src/` i jest kompilowany przez Metro normalnie -
 * tracimy tylko statyczne typowanie samej rejestracji (2 linie), co jest
 * akceptowalnym kompromisem za stabilność buildu.
 */
const { registerRootComponent } = require('expo');
const {
  registerWidgetTaskHandler,
} = require('react-native-android-widget');

const App = require('./App').default;
const { widgetTaskHandler } = require('./src/widgets/widgetTaskHandler.js');

registerRootComponent(App);
registerWidgetTaskHandler(widgetTaskHandler);