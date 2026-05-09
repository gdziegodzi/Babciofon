/**
 * Motyw aplikacji Babciofon
 * Zoptymalizowany pod kątem dostępności dla seniorów:
 * - duże, czytelne fonty
 * - wysoki kontrast (WCAG AAA)
 * - duże targety dotykowe (min 64dp - powyżej zalecanych 48dp)
 */

export const colors = {
  normal: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    primary: '#0B6FB8',
    primaryText: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#555555',
    border: '#CCCCCC',
    danger: '#C62828',
    dangerText: '#FFFFFF',
    success: '#2E7D32',
  },
  highContrast: {
    background: '#000000',
    surface: '#1A1A1A',
    primary: '#FFEB3B',
    primaryText: '#000000',
    text: '#FFFFFF',
    textSecondary: '#FFFFFF',
    border: '#FFFFFF',
    danger: '#FF1744',
    dangerText: '#FFFFFF',
    success: '#00E676',
  },
};

export const baseFontSizes = {
  small: 16,
  body: 20,
  button: 24,
  title: 28,
  hero: 36, // np. duże przyciski kontaktów na ekranie Start
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
};

/** Minimalna wysokość dotykowych elementów (przyciski) */
export const TOUCH_TARGET = 64;

/** Skaluje rozmiar fontu wg ustawienia użytkownika */
export const scaledFont = (size: number, fontScale: number): number =>
  Math.round(size * fontScale);

export type ColorScheme = typeof colors.normal;

export const getColors = (highContrast: boolean): ColorScheme =>
  highContrast ? colors.highContrast : colors.normal;
