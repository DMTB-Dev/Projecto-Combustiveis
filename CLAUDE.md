# CLAUDE.md — Combustíveis Project Instructions

## Project Overview
Combustíveis is a React Native (Expo) mobile app that helps Portuguese drivers find the cheapest fuel near them. It shows real-time prices from all fuel stations in continental Portugal, weekly price forecasts, price history charts, and a savings calculator.

**Target platforms:** iOS + Android (single codebase)
**Target market:** Portugal (Portuguese-first UI)
**Data source:** API Aberta (https://apiaberta.pt) → cached in Supabase

## Tech Stack
- **Framework:** React Native with Expo SDK 52+ 
- **Language:** TypeScript (strict mode)
- **Navigation:** Expo Router (file-based routing)
- **Maps:** react-native-maps (Apple Maps on iOS, Google Maps on Android)
- **Location:** expo-location
- **State management:** Zustand
- **Local storage:** AsyncStorage (user preferences, favorites)
- **Charts:** react-native-chart-kit or Victory Native
- **Backend:** Supabase (PostgreSQL + REST API)
- **Data source:** API Aberta REST API (https://api.apiaberta.pt/v1/fuel/*)
- **Deployment:** EAS Build + EAS Submit

## Key Commands
```bash
npx expo start          # Start dev server
npx expo start --ios    # Start on iOS simulator
npx expo start --android # Start on Android emulator
eas build --platform ios --profile preview  # Build iOS preview
eas build --platform android --profile preview  # Build Android preview
```

## Project Structure (target)
```
combustiveis/
├── CLAUDE.md              # This file
├── README.md
├── PRD.md                 # Product Requirements Document
├── DESIGN.md              # Design system
├── app/                   # Expo Router pages
│   ├── _layout.tsx        # Root layout (tab navigator)
│   ├── index.tsx          # Home tab (Início)
│   ├── map.tsx            # Map tab (Mapa)
│   ├── calculator.tsx     # Calculator tab (Calculadora)
│   ├── settings.tsx       # Settings tab (Definições)
│   └── station/
│       └── [id].tsx       # Station detail screen
├── components/
│   ├── ForecastBanner.tsx  # Weekly price forecast card
│   ├── StationCard.tsx     # Station list item
│   ├── StationMap.tsx      # Map with markers
│   ├── PriceChart.tsx      # Price history chart
│   ├── FuelTypeSelector.tsx # Fuel type pill selector
│   ├── TankCalculator.tsx  # Savings calculator
│   └── ui/                 # Reusable UI primitives
├── lib/
│   ├── supabase.ts        # Supabase client config
│   ├── api.ts             # API Aberta helpers (if calling directly)
│   ├── location.ts        # Location permission + distance calc
│   └── constants.ts       # Fuel type slugs, brand mappings, colors
├── stores/
│   └── usePreferences.ts  # Zustand store for user preferences
├── assets/
│   └── brands/            # Fuel brand logos (Galp, BP, Repsol, etc.)
├── scripts/
│   └── sync-prices.ts     # API Aberta → Supabase sync script
├── .github/
│   └── workflows/
│       └── sync-prices.yml # Daily cron job for price sync
└── supabase/
    └── schema.sql          # Database schema
```

## Design System
- **Font:** Plus Jakarta Sans (all weights 400-800)
- **Primary:** #10A3FF (blue) — CTAs, interactive elements
- **Secondary:** #00E676 (green) — savings, "cheaper" badges, price drops
- **Tertiary:** #FF9100 (orange) — urgency, price increases, "fill now" alerts
- **Neutral/Background:** #F0F4F8 (light grey)
- **Roundedness:** Maximum (pill-shaped buttons, ~16px border-radius cards)
- **Spacing:** Normal/balanced
- See DESIGN.md for full details

## API Aberta — Fuel Endpoints
Base URL: `https://api.apiaberta.pt`
Auth: `X-API-Key: <key>` header (key stored in .env as API_ABERTA_KEY)

```
GET /v1/fuel/prices                    # National averages
GET /v1/fuel/stations?fuel=<slug>      # Stations with prices
GET /v1/fuel/cheapest?fuel=<slug>      # Cheapest stations
```

### Fuel type slugs we support:
| Slug           | Display name (PT)    |
|----------------|----------------------|
| diesel         | Gasóleo simples      |
| diesel_plus    | Gasóleo aditivado    |
| gasoline_95    | Gasolina 95          |
| gasoline_98    | Gasolina 98          |
| gpl_auto       | GPL Auto             |

## Supabase Schema
Tables: `stations`, `prices`, `current_prices` (materialized view), `weekly_forecast`
See `supabase/schema.sql` for full schema.
Connection details stored in .env as SUPABASE_URL and SUPABASE_ANON_KEY.

## Critical Rules
1. **All UI text must be in Portuguese.** Use "Gasóleo" not "Diesel", "Gasolina" not "Gasoline", "km" not "miles", "€/L" not "$/gal".
2. **Prices are always in EUR per liter** with 3 decimal places (e.g., €1.659).
3. **Distances are always in km** with 1 decimal place.
4. **Continental Portugal only.** Azores and Madeira are NOT covered — they have different regulated pricing systems.
5. **Always show "last updated" timestamps** on price data. Flag stale data (>48h) with a warning.
6. **Brand logos** should be used for station identification (Galp, BP, Repsol, Prio, Intermarché, E.Leclerc, Cepsa, Alves Bandeira, Auchan, Jumbo). Use a generic fuel pump icon as fallback.
7. **No user accounts in v1.** All preferences stored locally via AsyncStorage.
8. **The weekly forecast banner is the hero feature.** It must be the first thing visible on the Home screen.
9. **Performance matters.** Use FlatList virtualization, memoize map markers, debounce map movement queries.
10. **Keep dependencies minimal.** Don't add libraries unless clearly needed.

## Environment Variables (.env)
```
API_ABERTA_KEY=<your-key>
SUPABASE_URL=<your-url>
SUPABASE_ANON_KEY=<your-anon-key>
```
Never commit .env to git. Use .env.example with placeholder values.

## Brand Logo Mapping
Map these brand strings from API Aberta to local logo assets:
```typescript
const BRAND_LOGOS: Record<string, any> = {
  'Galp': require('../assets/brands/galp.png'),
  'BP': require('../assets/brands/bp.png'),
  'Repsol': require('../assets/brands/repsol.png'),
  'Prio': require('../assets/brands/prio.png'),
  'Intermarché': require('../assets/brands/intermarche.png'),
  'E.Leclerc': require('../assets/brands/eleclerc.png'),
  'Cepsa': require('../assets/brands/cepsa.png'),
  'Alves Bandeira': require('../assets/brands/alvesbandeira.png'),
  'Auchan': require('../assets/brands/auchan.png'),
  'Jumbo': require('../assets/brands/jumbo.png'),
}
// Fallback: generic fuel pump icon for unknown brands
```

## Navigation Structure
```
Tab Bar (bottom, 4 tabs):
├── Início (Home) — index.tsx
│   ├── ForecastBanner (weekly price prediction)
│   ├── FuelTypeSelector (pill chips)
│   ├── Sort toggle (distance / price)
│   └── Station list (FlatList of StationCards)
├── Mapa — map.tsx
│   ├── FuelTypeSelector overlay
│   ├── Clustered station markers
│   └── Bottom sheet on marker tap
├── Calculadora — calculator.tsx
│   ├── Tank size slider
│   ├── Station comparison (side by side)
│   └── Savings projections (weekly/monthly/yearly)
└── Definições — settings.tsx
    ├── Preferred fuel type
    ├── Tank size
    ├── Fill-up frequency
    ├── Favorites management
    └── About / Feedback
```

## Git Conventions
- Branch naming: `feature/<short-description>` or `fix/<short-description>`
- Commit messages: conventional commits (feat:, fix:, chore:, docs:)
- Main branch: `main`
