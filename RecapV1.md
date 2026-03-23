# Combustíveis v1 Prototype — Build Summary

## What was built
A complete React Native (Expo SDK 55) prototype for a Portuguese fuel price comparison app. The app runs on iOS, Android, and web (with fallbacks for web-incompatible native components).

## Repository
- **GitHub:** https://github.com/DMTB-Dev/Projecto-Combustiveis
- **Branch:** `main`
- **Commits:** 8 clean commits, conventional commit style
- **TypeScript:** Strict mode, zero type errors

## Screens built (6)
1. **Início (Home)** — `app/index.tsx` — Weekly forecast banners (hero feature), fuel type pill selector, station list sorted by distance or price, pull-to-refresh, "Mais barato" badge on cheapest station, favorite toggling
2. **Mapa (Map)** — `app/map.tsx` — Full map with color-coded station markers (green=cheap, red=expensive), callouts with station info, recenter button, fuel type overlay. Web fallback shows styled station list.
3. **Calculadora (Calculator)** — `app/calculator.tsx` — Tank size slider (20-200L), fill-up frequency selector, side-by-side station comparison, per-fill/monthly/yearly savings projections, forecast tie-in ("Se atestar hoje, poupa €X")
4. **Definições (Settings)** — `app/settings.tsx` — Preferred fuel type, tank size, fill-up frequency, favorites management, about section with API Aberta link
5. **Station Detail** — `app/station/[id].tsx` — All 5 fuel prices, price history line chart (7D/30D/90D/1A), min/avg/max stats, comparison vs national average, services badges, opening hours, "Como chegar" button (opens native maps)
6. **Tab Layout** — `app/_layout.tsx` — 4-tab bottom navigation with Plus Jakarta Sans font loading

## Components built (7)
- `ForecastBanner` — Color-coded weekly price prediction card with savings estimate
- `StationCard` — Station list item with brand badge, price, distance, cheapest indicator
- `FuelTypeSelector` — Horizontal scrolling pill chips for fuel type filtering
- `PriceChart` — Line chart with time range selector and period statistics
- `TankCalculator` — Side-by-side station cost comparison with savings breakdown
- `StationMap` — Map with markers + web fallback (conditional react-native-maps import)
- `BrandLogo` — Text-based colored circle badge (placeholder for real logos)

## Core libraries (5)
- `lib/types.ts` — TypeScript interfaces for Station, Price, Forecast, etc.
- `lib/constants.ts` — Design tokens (colors, spacing, fonts), fuel types, brand colors, districts
- `lib/supabase.ts` — Supabase client with placeholder config
- `lib/location.ts` — Location permissions, Haversine distance calculation, price/distance formatters
- `lib/mock-data.ts` — 12 mock stations in the Lisboa area, 3 forecasts, price history generator, national averages

## State management
- `stores/usePreferences.ts` — Zustand store persisted to AsyncStorage (fuel type, tank size, fill-up frequency, favorites, sort preference)

## Backend/infrastructure
- `scripts/sync-prices.ts` — Node.js script that fetches all 5 fuel types from API Aberta, upserts stations and inserts price records into Supabase. Handles pagination, rate limiting, error recovery.
- `.github/workflows/sync-prices.yml` — GitHub Actions cron job running daily at 08:00 UTC
- `supabase/schema.sql` — Full database schema (stations, prices, current_prices view, weekly_forecast, RLS policies, helper functions)

## What is NOT done yet / needs real credentials
- No API Aberta key configured (using mock data)
- No Supabase project connected (placeholder URL/key)
- Brand logos are text placeholders (need real PNG/SVG assets)
- No app store assets (icon, screenshots, store description)
- No EAS Build configuration
- No push notifications or price alerts
- Price history only starts accumulating once the sync script runs against real data

## Design system implemented
- Primary: #10A3FF (blue), Secondary: #00E676 (green), Tertiary: #FF9100 (orange)
- Font: Plus Jakarta Sans (all weights 400-800)
- Maximum roundedness (pill buttons, 16px card radius)
- All UI text in Portuguese
