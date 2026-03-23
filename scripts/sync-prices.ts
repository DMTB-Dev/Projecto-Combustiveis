/**
 * sync-prices.ts — API Aberta → Supabase price sync
 *
 * Fetches current fuel prices from API Aberta for all supported fuel types,
 * upserts station data, and inserts price records into Supabase.
 *
 * Run manually:   npx tsx scripts/sync-prices.ts
 * Run via CI:     GitHub Actions cron (see .github/workflows/sync-prices.yml)
 *
 * Requires env vars: API_ABERTA_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

import { createClient } from '@supabase/supabase-js';

// ── Config ─────────────────────────────────────────────────────

const API_ABERTA_BASE = 'https://api.apiaberta.pt';
const API_KEY = process.env.API_ABERTA_KEY || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

const FUEL_TYPES = ['diesel', 'diesel_plus', 'gasoline_95', 'gasoline_98', 'gpl_auto'] as const;
const PAGE_SIZE = 100;

// ── Supabase client (service role for writes) ──────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── API Aberta fetch ───────────────────────────────────────────

interface ApiAbertaStation {
  id: string;
  name: string;
  brand: string;
  address: string;
  district: string;
  municipality: string;
  latitude: number;
  longitude: number;
  price: number;
  [key: string]: unknown;
}

async function fetchStations(fuelType: string, page: number = 1): Promise<ApiAbertaStation[]> {
  const url = `${API_ABERTA_BASE}/v1/fuel/stations?fuel=${fuelType}&limit=${PAGE_SIZE}&page=${page}&sort=price_asc`;

  const headers: Record<string, string> = {};
  if (API_KEY) headers['X-API-Key'] = API_KEY;

  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error(`API Aberta error: ${res.status} ${res.statusText} for ${fuelType} page ${page}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : data.data ?? [];
}

async function fetchAllStations(fuelType: string): Promise<ApiAbertaStation[]> {
  const allStations: ApiAbertaStation[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const batch = await fetchStations(fuelType, page);
    allStations.push(...batch);

    if (batch.length < PAGE_SIZE) {
      hasMore = false;
    } else {
      page++;
    }

    // Rate limiting: small delay between pages
    await new Promise((r) => setTimeout(r, 200));
  }

  return allStations;
}

// ── Upsert logic ───────────────────────────────────────────────

async function upsertStation(station: ApiAbertaStation): Promise<string | null> {
  const { data, error } = await supabase
    .from('stations')
    .upsert(
      {
        api_aberta_id: station.id,
        name: station.name,
        brand: station.brand || 'Independente',
        address: station.address || '',
        district: station.district || '',
        municipality: station.municipality || '',
        latitude: station.latitude,
        longitude: station.longitude,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'api_aberta_id' },
    )
    .select('id')
    .single();

  if (error) {
    console.error(`  Error upserting station ${station.name}:`, error.message);
    return null;
  }

  return data?.id ?? null;
}

async function insertPrice(stationId: string, fuelType: string, price: number): Promise<void> {
  const { error } = await supabase.from('prices').insert({
    station_id: stationId,
    fuel_type: fuelType,
    price,
    reported_at: new Date().toISOString(),
  });

  if (error) {
    console.error(`  Error inserting price for station ${stationId}:`, error.message);
  }
}

// ── Main sync ──────────────────────────────────────────────────

async function syncFuelType(fuelType: string): Promise<{ stations: number; prices: number }> {
  console.log(`\nSyncing ${fuelType}...`);

  const apiStations = await fetchAllStations(fuelType);
  console.log(`  Fetched ${apiStations.length} stations from API Aberta`);

  let stationsUpserted = 0;
  let pricesInserted = 0;

  for (const apiStation of apiStations) {
    const stationId = await upsertStation(apiStation);
    if (stationId && apiStation.price > 0) {
      await insertPrice(stationId, fuelType, apiStation.price);
      pricesInserted++;
    }
    stationsUpserted++;
  }

  console.log(`  Upserted ${stationsUpserted} stations, inserted ${pricesInserted} prices`);
  return { stations: stationsUpserted, prices: pricesInserted };
}

async function main() {
  console.log('=== Combustíveis Price Sync ===');
  console.log(`Time: ${new Date().toISOString()}`);

  // Validate config
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
    process.exit(1);
  }

  if (!API_KEY) {
    console.warn('Warning: API_ABERTA_KEY not set, using unauthenticated requests (30 req/min limit)');
  }

  let totalStations = 0;
  let totalPrices = 0;

  for (const fuelType of FUEL_TYPES) {
    try {
      const result = await syncFuelType(fuelType);
      totalStations += result.stations;
      totalPrices += result.prices;
    } catch (err) {
      console.error(`  Failed to sync ${fuelType}:`, err);
    }

    // Delay between fuel types to respect rate limits
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log('\n=== Sync Complete ===');
  console.log(`Total: ${totalStations} station upserts, ${totalPrices} price inserts`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
