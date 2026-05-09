import * as Location from 'expo-location';

export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
  /** True jeśli to fallback (ostatnia znana, nie aktualna). */
  isStale: boolean;
}

export class LocationPermissionError extends Error {
  constructor() {
    super('Brak uprawnień do lokalizacji.');
    this.name = 'LocationPermissionError';
  }
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

/**
 * Pobiera aktualną lokalizację. Strategia:
 * 1. Spróbuj świeżej pozycji z timeoutem (5s) - dokładność Balanced (zgoda na ~50m)
 * 2. Jeśli timeout/błąd - zwróć ostatnią znaną (isStale: true)
 * 3. Jeśli nadal brak - rzuć błąd
 */
export async function getCurrentLocation(
  timeoutMs = 5000
): Promise<LocationResult> {
  const granted = await requestLocationPermission();
  if (!granted) {
    throw new LocationPermissionError();
  }

  try {
    const fresh = await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout pobierania GPS')), timeoutMs)
      ),
    ]);
    return {
      latitude: fresh.coords.latitude,
      longitude: fresh.coords.longitude,
      accuracy: fresh.coords.accuracy ?? null,
      timestamp: fresh.timestamp,
      isStale: false,
    };
  } catch {
    // Fallback na ostatnią znaną pozycję
    const last = await Location.getLastKnownPositionAsync();
    if (last) {
      return {
        latitude: last.coords.latitude,
        longitude: last.coords.longitude,
        accuracy: last.coords.accuracy ?? null,
        timestamp: last.timestamp,
        isStale: true,
      };
    }
    throw new Error('Nie udało się pobrać lokalizacji - brak GPS i brak ostatniej znanej pozycji.');
  }
}

/** Formatuje współrzędne jako link do Google Maps. */
export function formatLocationAsLink(loc: LocationResult): string {
  const lat = loc.latitude.toFixed(5);
  const lng = loc.longitude.toFixed(5);
  return `https://maps.google.com/?q=${lat},${lng}`;
}

/** Formatuje współrzędne jako tekst do podglądu w UI. */
export function formatLocationForDisplay(loc: LocationResult): string {
  const lat = loc.latitude.toFixed(5);
  const lng = loc.longitude.toFixed(5);
  const acc = loc.accuracy ? ` (±${Math.round(loc.accuracy)} m)` : '';
  const stale = loc.isStale ? ' [ostatnia znana]' : '';
  return `${lat}, ${lng}${acc}${stale}`;
}
