export type FuelType = 'diesel' | 'diesel_plus' | 'gasoline_95' | 'gasoline_98' | 'gpl_auto';

export type ForecastDirection = 'up' | 'down' | 'stable';
export type ForecastAdvice = 'fill_now' | 'wait' | 'no_difference';

export interface Station {
  id: string;
  api_aberta_id: string;
  name: string;
  brand: string;
  address: string;
  district: string;
  municipality: string;
  latitude: number;
  longitude: number;
  opening_hours: string | null;
  services: string[];
  active: boolean;
}

export interface Price {
  id: string;
  station_id: string;
  fuel_type: FuelType;
  price: number;
  reported_at: string;
}

export interface StationWithPrice extends Station {
  price: number;
  fuel_type: FuelType;
  reported_at: string;
  distance?: number;
}

export interface WeeklyForecast {
  id: string;
  fuel_type: FuelType;
  direction: ForecastDirection;
  change_cents: number;
  advice: ForecastAdvice;
  advice_text_pt: string;
  effective_date: string;
  published_at: string;
  active: boolean;
}

export interface CurrentPrice {
  id: string;
  station_id: string;
  fuel_type: FuelType;
  price: number;
  reported_at: string;
  station_name: string;
  brand: string;
  address: string;
  district: string;
  municipality: string;
  latitude: number;
  longitude: number;
  opening_hours: string | null;
  services: string[];
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
}

export interface DistrictAverage {
  district: string;
  avg_price: number;
}
