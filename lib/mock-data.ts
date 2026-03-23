import type {
  StationWithPrice,
  WeeklyForecast,
  PriceHistoryPoint,
  FuelType,
} from './types';

// ── Mock Stations (Lisboa area) ────────────────────────────────

const BASE_STATIONS: Omit<StationWithPrice, 'distance'>[] = [
  {
    id: '1', api_aberta_id: 'aa-001', name: 'Galp A.S. Aeroporto', brand: 'Galp',
    address: 'Av. Berlim, 1800-031 Lisboa', district: 'Lisboa', municipality: 'Lisboa',
    latitude: 38.7693, longitude: -9.1289, opening_hours: '06:00-23:00',
    services: ['loja', 'lavagem', 'ar/água'], active: true,
    price: 1.559, fuel_type: 'diesel', reported_at: '2026-03-23T08:00:00Z',
  },
  {
    id: '2', api_aberta_id: 'aa-002', name: 'BP Marquês de Pombal', brand: 'BP',
    address: 'Praça Marquês de Pombal, 1250-160 Lisboa', district: 'Lisboa', municipality: 'Lisboa',
    latitude: 38.7253, longitude: -9.1500, opening_hours: '24h',
    services: ['loja', 'ar/água'], active: true,
    price: 1.589, fuel_type: 'diesel', reported_at: '2026-03-23T08:00:00Z',
  },
  {
    id: '3', api_aberta_id: 'aa-003', name: 'Repsol Benfica', brand: 'Repsol',
    address: 'Estrada de Benfica 382, 1500-100 Lisboa', district: 'Lisboa', municipality: 'Lisboa',
    latitude: 38.7480, longitude: -9.1880, opening_hours: '06:00-22:00',
    services: ['loja'], active: true,
    price: 1.549, fuel_type: 'diesel', reported_at: '2026-03-23T08:00:00Z',
  },
  {
    id: '4', api_aberta_id: 'aa-004', name: 'Prio Cascais', brand: 'Prio',
    address: 'Av. 25 de Abril, 2750-512 Cascais', district: 'Lisboa', municipality: 'Cascais',
    latitude: 38.6968, longitude: -9.4215, opening_hours: '06:00-22:00',
    services: ['loja', 'lavagem'], active: true,
    price: 1.529, fuel_type: 'diesel', reported_at: '2026-03-23T08:00:00Z',
  },
  {
    id: '5', api_aberta_id: 'aa-005', name: 'Intermarché Sintra', brand: 'Intermarché',
    address: 'R. Elias Garcia, 2710-500 Sintra', district: 'Lisboa', municipality: 'Sintra',
    latitude: 38.7985, longitude: -9.3780, opening_hours: '07:00-21:00',
    services: ['loja'], active: true,
    price: 1.509, fuel_type: 'diesel', reported_at: '2026-03-23T08:00:00Z',
  },
  {
    id: '6', api_aberta_id: 'aa-006', name: 'E.Leclerc Amadora', brand: 'E.Leclerc',
    address: 'CC Dolce Vita Tejo, Amadora', district: 'Lisboa', municipality: 'Amadora',
    latitude: 38.7540, longitude: -9.2310, opening_hours: '08:00-22:00',
    services: ['loja', 'ar/água'], active: true,
    price: 1.499, fuel_type: 'diesel', reported_at: '2026-03-23T08:00:00Z',
  },
  {
    id: '7', api_aberta_id: 'aa-007', name: 'Cepsa Almada', brand: 'Cepsa',
    address: 'Av. Casal Ribeiro, 2800-100 Almada', district: 'Setúbal', municipality: 'Almada',
    latitude: 38.6788, longitude: -9.1563, opening_hours: '24h',
    services: ['loja', 'lavagem', 'ar/água'], active: true,
    price: 1.569, fuel_type: 'diesel', reported_at: '2026-03-23T08:00:00Z',
  },
  {
    id: '8', api_aberta_id: 'aa-008', name: 'Galp Expo', brand: 'Galp',
    address: 'Parque das Nações, 1990-100 Lisboa', district: 'Lisboa', municipality: 'Lisboa',
    latitude: 38.7650, longitude: -9.0980, opening_hours: '06:00-23:00',
    services: ['loja', 'lavagem', 'ar/água'], active: true,
    price: 1.579, fuel_type: 'diesel', reported_at: '2026-03-23T08:00:00Z',
  },
  {
    id: '9', api_aberta_id: 'aa-009', name: 'Alves Bandeira Setúbal', brand: 'Alves Bandeira',
    address: 'EN 10, 2900-100 Setúbal', district: 'Setúbal', municipality: 'Setúbal',
    latitude: 38.5244, longitude: -8.8940, opening_hours: '06:00-22:00',
    services: ['loja'], active: true,
    price: 1.539, fuel_type: 'diesel', reported_at: '2026-03-23T08:00:00Z',
  },
  {
    id: '10', api_aberta_id: 'aa-010', name: 'Jumbo Alfragide', brand: 'Jumbo',
    address: 'IC 19, 2720-094 Amadora', district: 'Lisboa', municipality: 'Amadora',
    latitude: 38.7380, longitude: -9.2200, opening_hours: '08:00-22:00',
    services: ['loja'], active: true,
    price: 1.489, fuel_type: 'diesel', reported_at: '2026-03-23T08:00:00Z',
  },
  {
    id: '11', api_aberta_id: 'aa-011', name: 'Auchan Alfragide', brand: 'Auchan',
    address: 'Estrada Nacional, 2720-094 Amadora', district: 'Lisboa', municipality: 'Amadora',
    latitude: 38.7360, longitude: -9.2190, opening_hours: '08:00-21:00',
    services: ['loja', 'ar/água'], active: true,
    price: 1.495, fuel_type: 'diesel', reported_at: '2026-03-23T08:00:00Z',
  },
  {
    id: '12', api_aberta_id: 'aa-012', name: 'BP Saldanha', brand: 'BP',
    address: 'Av. Fontes Pereira de Melo, 1050-120 Lisboa', district: 'Lisboa', municipality: 'Lisboa',
    latitude: 38.7340, longitude: -9.1456, opening_hours: '24h',
    services: ['loja', 'lavagem', 'ar/água'], active: true,
    price: 1.599, fuel_type: 'diesel', reported_at: '2026-03-23T08:00:00Z',
  },
];

// Price offsets per fuel type relative to diesel
const FUEL_OFFSETS: Record<FuelType, number> = {
  diesel: 0,
  diesel_plus: 0.08,
  gasoline_95: 0.10,
  gasoline_98: 0.22,
  gpl_auto: -0.72,
};

/**
 * Get mock stations with prices for a given fuel type.
 * Applies realistic price offsets per fuel type.
 */
export function getMockStations(fuelType: FuelType = 'diesel'): StationWithPrice[] {
  const offset = FUEL_OFFSETS[fuelType];
  return BASE_STATIONS.map((s) => ({
    ...s,
    fuel_type: fuelType,
    price: Math.round((s.price + offset) * 1000) / 1000,
  }));
}

/**
 * Get mock stations sorted by distance from a given location.
 */
export function getMockStationsNear(
  lat: number,
  lng: number,
  fuelType: FuelType = 'diesel',
): StationWithPrice[] {
  const stations = getMockStations(fuelType);
  return stations
    .map((s) => {
      const dLat = s.latitude - lat;
      const dLng = s.longitude - lng;
      const distance = Math.sqrt(dLat * dLat + dLng * dLng) * 111.32; // rough km
      return { ...s, distance: Math.round(distance * 10) / 10 };
    })
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
}

// ── Mock Forecasts ─────────────────────────────────────────────

export const MOCK_FORECASTS: WeeklyForecast[] = [
  {
    id: 'f1',
    fuel_type: 'diesel',
    direction: 'up',
    change_cents: 2.5,
    advice: 'fill_now',
    advice_text_pt: 'Gasóleo sobe 2.5 cênt. Ateste hoje!',
    effective_date: '2026-03-30',
    published_at: '2026-03-22T10:00:00Z',
    active: true,
  },
  {
    id: 'f2',
    fuel_type: 'gasoline_95',
    direction: 'down',
    change_cents: 1.0,
    advice: 'wait',
    advice_text_pt: 'Gasolina 95 desce 1.0 cênt. Espere até segunda!',
    effective_date: '2026-03-30',
    published_at: '2026-03-22T10:00:00Z',
    active: true,
  },
  {
    id: 'f3',
    fuel_type: 'gasoline_98',
    direction: 'stable',
    change_cents: 0,
    advice: 'no_difference',
    advice_text_pt: 'Gasolina 98 mantém-se estável.',
    effective_date: '2026-03-30',
    published_at: '2026-03-22T10:00:00Z',
    active: true,
  },
];

// ── Mock Price History ─────────────────────────────────────────

export function getMockPriceHistory(
  _stationId: string,
  _fuelType: FuelType = 'diesel',
  days: number = 30,
): PriceHistoryPoint[] {
  const points: PriceHistoryPoint[] = [];
  const basePrice = 1.55;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    // Simulate realistic price movement
    const trend = Math.sin(i / 7) * 0.02;
    const noise = (Math.random() - 0.5) * 0.01;
    const price = Math.round((basePrice + trend + noise) * 1000) / 1000;
    points.push({
      date: date.toISOString().split('T')[0],
      price,
    });
  }
  return points;
}

// ── National Average (mock) ────────────────────────────────────

export const MOCK_NATIONAL_AVERAGES: Record<FuelType, number> = {
  diesel: 1.549,
  diesel_plus: 1.629,
  gasoline_95: 1.649,
  gasoline_98: 1.769,
  gpl_auto: 0.829,
};
