-- Combustíveis — Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up all tables

-- Enable PostGIS for geospatial queries (optional for v1, useful later)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- FUEL TYPE ENUM
-- ============================================
CREATE TYPE fuel_type AS ENUM (
  'diesel',
  'diesel_plus',
  'gasoline_95',
  'gasoline_98',
  'gpl_auto'
);

-- ============================================
-- STATIONS TABLE
-- ============================================
CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_aberta_id TEXT UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  address TEXT,
  district TEXT,
  municipality TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  opening_hours TEXT,
  services TEXT[],
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for geospatial-ish queries (bounding box filtering)
CREATE INDEX idx_stations_lat_lng ON stations (latitude, longitude);
CREATE INDEX idx_stations_district ON stations (district);
CREATE INDEX idx_stations_brand ON stations (brand);

-- ============================================
-- PRICES TABLE (append-only, builds history)
-- ============================================
CREATE TABLE prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  fuel_type fuel_type NOT NULL,
  price DECIMAL(6, 3) NOT NULL, -- e.g., 1.659 EUR/L
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Critical index for "current price" and "price history" queries
CREATE INDEX idx_prices_station_fuel_date ON prices (station_id, fuel_type, reported_at DESC);
CREATE INDEX idx_prices_fuel_type ON prices (fuel_type);
CREATE INDEX idx_prices_reported_at ON prices (reported_at DESC);

-- ============================================
-- CURRENT PRICES VIEW
-- Latest price per station per fuel type
-- ============================================
CREATE OR REPLACE VIEW current_prices AS
SELECT DISTINCT ON (station_id, fuel_type)
  p.id,
  p.station_id,
  p.fuel_type,
  p.price,
  p.reported_at,
  s.name AS station_name,
  s.brand,
  s.address,
  s.district,
  s.municipality,
  s.latitude,
  s.longitude,
  s.opening_hours,
  s.services
FROM prices p
JOIN stations s ON s.id = p.station_id
WHERE s.active = TRUE
ORDER BY station_id, fuel_type, reported_at DESC;

-- ============================================
-- WEEKLY FORECAST TABLE
-- Updated manually by app operator (you)
-- ============================================
CREATE TYPE forecast_direction AS ENUM ('up', 'down', 'stable');
CREATE TYPE forecast_advice AS ENUM ('fill_now', 'wait', 'no_difference');

CREATE TABLE weekly_forecast (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fuel_type fuel_type NOT NULL,
  direction forecast_direction NOT NULL,
  change_cents DECIMAL(4, 1), -- e.g., 2.5 (cents per liter)
  advice forecast_advice NOT NULL,
  advice_text_pt TEXT NOT NULL, -- e.g., "Gasolina 95 sobe 2.5 cênt. Ateste hoje!"
  effective_date DATE NOT NULL, -- when the price change takes effect (usually Monday)
  published_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE,
  UNIQUE(fuel_type, effective_date) -- one forecast per fuel type per week
);

-- ============================================
-- ROW LEVEL SECURITY
-- Public read access for all tables (no auth needed in v1)
-- ============================================
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_forecast ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads
CREATE POLICY "Public read access" ON stations FOR SELECT USING (true);
CREATE POLICY "Public read access" ON prices FOR SELECT USING (true);
CREATE POLICY "Public read access" ON weekly_forecast FOR SELECT USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get average price by district for a fuel type
CREATE OR REPLACE FUNCTION get_district_averages(p_fuel_type fuel_type)
RETURNS TABLE(district TEXT, avg_price DECIMAL) AS $$
  SELECT 
    cp.district,
    ROUND(AVG(cp.price)::numeric, 3) AS avg_price
  FROM current_prices cp
  WHERE cp.fuel_type = p_fuel_type
  GROUP BY cp.district
  ORDER BY avg_price ASC;
$$ LANGUAGE SQL STABLE;

-- Function to get national average for a fuel type
CREATE OR REPLACE FUNCTION get_national_average(p_fuel_type fuel_type)
RETURNS DECIMAL AS $$
  SELECT ROUND(AVG(price)::numeric, 3)
  FROM current_prices
  WHERE fuel_type = p_fuel_type;
$$ LANGUAGE SQL STABLE;
