import type { FuelType, ForecastDirection, ForecastAdvice } from './types';

// ── Design Tokens ──────────────────────────────────────────────

export const Colors = {
  primary: '#10A3FF',
  secondary: '#00E676',
  tertiary: '#FF9100',
  background: '#F0F4F8',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  error: '#EF4444',
  priceUp: '#EF4444',
  priceDown: '#00E676',
  priceStable: '#9CA3AF',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// ── Fuel Types ─────────────────────────────────────────────────

export const FUEL_TYPES: { slug: FuelType; label: string; short: string }[] = [
  { slug: 'diesel', label: 'Gasóleo simples', short: 'Gasóleo' },
  { slug: 'diesel_plus', label: 'Gasóleo aditivado', short: 'Gasóleo+' },
  { slug: 'gasoline_95', label: 'Gasolina 95', short: 'G95' },
  { slug: 'gasoline_98', label: 'Gasolina 98', short: 'G98' },
  { slug: 'gpl_auto', label: 'GPL Auto', short: 'GPL' },
];

export const FUEL_TYPE_MAP: Record<FuelType, string> = {
  diesel: 'Gasóleo simples',
  diesel_plus: 'Gasóleo aditivado',
  gasoline_95: 'Gasolina 95',
  gasoline_98: 'Gasolina 98',
  gpl_auto: 'GPL Auto',
};

// ── Brands ─────────────────────────────────────────────────────

export const BRANDS = [
  'Galp',
  'BP',
  'Repsol',
  'Prio',
  'Intermarché',
  'E.Leclerc',
  'Cepsa',
  'Alves Bandeira',
  'Auchan',
  'Jumbo',
] as const;

export const BRAND_COLORS: Record<string, string> = {
  'Galp': '#FF6600',
  'BP': '#009900',
  'Repsol': '#FF4400',
  'Prio': '#E31E24',
  'Intermarché': '#D4213D',
  'E.Leclerc': '#003DA5',
  'Cepsa': '#C8102E',
  'Alves Bandeira': '#0055A4',
  'Auchan': '#E30613',
  'Jumbo': '#E3001B',
};

// ── Forecast Display ───────────────────────────────────────────

export const DIRECTION_LABELS: Record<ForecastDirection, string> = {
  up: '↑ Sobe',
  down: '↓ Desce',
  stable: '→ Estável',
};

export const DIRECTION_COLORS: Record<ForecastDirection, string> = {
  up: Colors.priceUp,
  down: Colors.priceDown,
  stable: Colors.priceStable,
};

export const ADVICE_LABELS: Record<ForecastAdvice, string> = {
  fill_now: 'Ateste hoje!',
  wait: 'Espere até segunda!',
  no_difference: 'Preço estável',
};

// ── Districts ──────────────────────────────────────────────────

export const DISTRICTS = [
  'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco',
  'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria',
  'Lisboa', 'Portalegre', 'Porto', 'Santarém',
  'Setúbal', 'Viana do Castelo', 'Vila Real', 'Viseu',
] as const;

// ── API Config ─────────────────────────────────────────────────

export const API_ABERTA_BASE_URL = 'https://api.apiaberta.pt';
export const DEFAULT_TANK_SIZE = 50;
export const DEFAULT_FUEL_TYPE: FuelType = 'diesel';
export const DEFAULT_FILLUPS_PER_MONTH = 4;
export const STALE_DATA_HOURS = 48;
