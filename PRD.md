# Combustíveis — Product Requirements Document (v1)

**Version:** 1.1
**Date:** March 22, 2026
**Status:** Ready for development

---

## 1. Overview

### What is Combustíveis?

Combustíveis is a mobile app that helps drivers in Portugal find the cheapest fuel near them, track price trends over time, and make smarter fueling decisions. It answers two questions every Portuguese driver asks weekly: "Where's the cheapest fuel near me?" and "Should I fill up now or wait until next week?"

### Why does it exist?

Fuel prices in Portugal are among the highest in Europe and rising. Existing solutions (Mais Gasolina, Já Tanquei) are functional but dated in design and limited in intelligence. Combustíveis aims to be the most beautiful, intuitive, and genuinely useful fuel app in Portugal — starting simple and growing based on real user needs.

### Target users

- Daily commuters in Portugal who fuel up 1–2x per week
- Price-sensitive drivers who currently check Mais Gasolina or DGEG manually
- Anyone who drives in Portugal and wants to spend less on fuel

### Success metrics (first 3 months)

- 1,000+ downloads
- 30% weekly retention (users who return at least once per week)
- 4.5+ star rating on App Store / Google Play

---

## 2. Tech Stack

### Frontend (Mobile App)

- **Framework:** React Native with Expo (SDK 52+)
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based routing)
- **Maps:** react-native-maps (uses Apple Maps on iOS, Google Maps on Android)
- **Location:** expo-location
- **State management:** Zustand (lightweight, simple)
- **Charts:** react-native-chart-kit or Victory Native
- **Storage (local):** AsyncStorage for user preferences (tank size, preferred fuel type, favorite stations)

### Backend & Data

- **Primary data source: API Aberta** (https://apiaberta.pt)
  - Open-source, MIT-licensed REST API that aggregates and normalizes Portuguese government data
  - GitHub: https://github.com/apiaberta/apiaberta
  - Fuel connector: https://github.com/apiaberta/connector-fuel
  - Source data comes from DGEG (precoscombustiveis.dgeg.gov.pt) — legally mandated price reporting by all fuel stations
  - Data syncs daily at 07:30 Lisbon time, covers all 14 fuel types and all mainland stations
  - Free tier: 30 req/min without API key, 300 req/min with free API key
  - JavaScript SDK available: `npm install apiaberta`

- **Backend-as-a-Service:** Supabase (PostgreSQL database + REST API)
  - Used for: local caching of API Aberta data, price history storage, weekly forecast table, and any future user features
  - Free tier: 500MB database, 50k monthly active users
  - Why cache instead of calling API Aberta directly? To build our own price history, enable offline-ish behavior, and not be fully dependent on a third-party API's uptime

- **Weekly forecast:** Simple table in Supabase updated manually (a single row with forecast text, direction indicator, and effective date)

### Development & Deployment

- **Expo Application Services (EAS):** For building and submitting to App Store and Google Play
- **Over-the-air updates:** Expo Updates for pushing fixes without app store review
- **Version control:** Git + GitHub

---

## 3. API Aberta — Fuel Endpoints Reference

The app's primary data source. Register for a free API key at https://app.apiaberta.pt.

### Endpoints

```
GET /v1/fuel/prices           → National averages per fuel type
GET /v1/fuel/stations         → Stations (filter by fuel, district, brand, sort)
GET /v1/fuel/cheapest         → Cheapest stations per fuel type
```

### Query parameters for `/v1/fuel/stations`

| Parameter | Type    | Default       | Description                                    |
|-----------|---------|---------------|------------------------------------------------|
| fuel      | string  | gasoline_95   | Fuel type slug (see table below)               |
| district  | string  | —             | Filter by district (e.g. "Lisboa", "Porto")    |
| brand     | string  | —             | Filter by brand (e.g. "BP", "Galp")            |
| sort      | string  | price_asc     | Sort: price_asc, price_desc                    |
| page      | number  | 1             | Page number                                    |
| limit     | number  | 20            | Results per page (max 100)                     |

### Query parameters for `/v1/fuel/cheapest`

| Parameter | Type    | Default       | Description                                    |
|-----------|---------|---------------|------------------------------------------------|
| fuel      | string  | gasoline_95   | Fuel type slug                                 |
| limit     | number  | 10            | Number of stations to return                   |

### Fuel type slugs (v1 — the 5 we support)

| Slug             | Name in app          | DGEG name               |
|------------------|----------------------|--------------------------|
| diesel           | Gasóleo simples      | Gasóleo simples          |
| diesel_plus      | Gasóleo aditivado    | Gasóleo especial         |
| gasoline_95      | Gasolina 95          | Gasolina simples 95      |
| gasoline_98      | Gasolina 98          | Gasolina 98              |
| gpl_auto         | GPL Auto             | GPL Auto                 |

Additional slugs exist in the API (gasoline_95_plus, gasoline_98_plus, diesel_colored, diesel_heating, biodiesel_b15, gnc_m3, gnc_kg, gnl_kg) but are out of scope for v1.

### Data sync schedule

API Aberta syncs from DGEG daily at 07:30 Lisbon time. The full sync takes 2–5 minutes across all 14 fuel types with pagination of 500 stations/page. If no data exists for the current day when the connector starts, it fetches immediately.

### SDK usage example

```javascript
import { ApiAberta } from 'apiaberta'

const api = new ApiAberta({ apiKey: 'YOUR_KEY' })

// National averages
const prices = await api.fuelPrices()

// Stations in Lisboa, cheapest diesel first
const stations = await api.fuelStations({
  fuel: 'diesel',
  district: 'Lisboa',
  sort: 'price_asc',
  limit: 20
})

// Top 10 cheapest Gasolina 95 nationwide
const cheapest = await api.fuelCheapest({
  fuel: 'gasoline_95',
  limit: 10
})
```

---

## 4. Data Model (Supabase cache + app-specific data)

### Why cache API Aberta data?

1. **Price history** — API Aberta serves current prices; we store daily snapshots to build charts
2. **Resilience** — if API Aberta is down, the app still works with cached data
3. **Performance** — local queries for geospatial filtering are faster than round-tripping to an external API
4. **Weekly forecast** — this is our own data, not from API Aberta

### Core Tables (Supabase/PostgreSQL)

```
stations
├── id (uuid, primary key)
├── api_aberta_id (text, unique) — ID from API Aberta
├── name (text) — e.g. "Galp A.S. Aeroporto"
├── brand (text) — e.g. "Galp", "BP", "Repsol", "Prio", "Intermarché"
├── address (text)
├── district (text) — e.g. "Lisboa", "Porto"
├── municipality (text) — e.g. "Cascais", "Sintra"
├── latitude (float)
├── longitude (float)
├── opening_hours (text)
├── services (text[]) — e.g. ["loja", "lavagem", "ar/água"]
├── active (boolean, default true)
├── created_at (timestamptz)
├── updated_at (timestamptz)

prices
├── id (uuid, primary key)
├── station_id (uuid, FK → stations.id)
├── fuel_type (enum: 'diesel', 'diesel_plus', 'gasoline_95', 'gasoline_98', 'gpl_auto')
├── price (decimal) — price in EUR per liter, e.g. 1.659
├── reported_at (timestamptz) — when the price was reported/fetched
├── created_at (timestamptz)
├── INDEX on (station_id, fuel_type, reported_at DESC) — for fast "current price" queries

current_prices (materialized view or computed)
├── station_id
├── fuel_type
├── price
├── reported_at
— Latest price per station per fuel type (for fast map/list queries)

weekly_forecast
├── id (uuid, primary key)
├── fuel_type (enum, same as above)
├── direction (enum: 'up', 'down', 'stable')
├── change_cents (decimal) — expected change in cents, e.g. 2.5
├── advice (enum: 'fill_now', 'wait', 'no_difference')
├── advice_text_pt (text) — Portuguese display text, e.g. "Gasolina 95 sobe 2.5 cênt. Ateste hoje!"
├── effective_date (date) — when the price change takes effect (usually next Monday)
├── published_at (timestamptz) — when you entered this forecast
├── active (boolean, default true)
```

### Data sync pipeline

```
[API Aberta]  ──GET /v1/fuel/stations──▶  [Sync Script]  ──upsert──▶  [Supabase]
  (daily @07:30)                          (GitHub Actions             (stations +
                                           cron, runs ~08:00)          prices tables)
                                                                          │
                                                                          ▼
                                                                    [Mobile App]
                                                                   (reads via Supabase
                                                                    REST API)
```

**Sync script:** A Node.js/TypeScript script that runs via GitHub Actions on a daily schedule (~08:00 Lisbon time, after API Aberta's 07:30 sync). It:
1. Calls API Aberta `/v1/fuel/stations` for each of the 5 supported fuel types
2. Upserts station data into the `stations` table
3. Inserts new price records into the `prices` table (building history over time)
4. Refreshes the `current_prices` materialized view

---

## 5. Geographic Coverage: Continental Portugal Only

### What's covered

The DGEG fuel price reporting obligation (DL 243/2008) applies to **continental Portugal only** ("território continental de Portugal"). API Aberta inherits this scope. This means all 18 districts of mainland Portugal are covered — from Viana do Castelo to Faro.

### Azores and Madeira — NOT covered in v1

The autonomous regions (Regiões Autónomas) have a fundamentally different fuel pricing system:

- **Azores:** Fuel prices are regulated with government-set maximum prices, updated monthly on the first day of each month. Managed by the regional government, not DGEG.
- **Madeira:** Also has regulated maximum prices set by the regional government, with weekly updates but capped by a government-defined ceiling.
- Both regions opted out of the liberalized fuel market when Portugal joined in 2004.
- There is no equivalent of the DGEG portal for island stations — prices are published through regional government decrees and portals (e.g., portal.azores.gov.pt).

**For v1:** The app will clearly state it covers Portugal Continental. A small note in the app ("Dados referentes a Portugal Continental") keeps it transparent. If users from the islands request coverage, this can be explored later — it would require separate data sources and handling of the regulated pricing model.

---

## 6. Features — Detailed Specifications

### 6.1 Weekly Price Forecast Banner

**Location:** Top of home screen, always visible. This is the hero feature.

**What it shows:**
- A card/banner per fuel type the user cares about (configurable, defaults to Gasóleo simples + Gasolina 95)
- Direction arrow (↑ up / ↓ down / → stable)
- Expected change amount (e.g. "+2.5 cênt/L")
- Clear advice: "Ateste hoje!" / "Espere até segunda!" / "Preço estável"
- Savings context: "Num depósito de 50L, poupa €1.25 se atestar hoje" (calculated from user's tank size setting)
- Effective date: "Preços mudam segunda-feira, 24 março"

**Data source:** `weekly_forecast` table, updated manually by the app operator (you). You update this on Friday/Saturday when Portuguese media publishes expected price changes for the following Monday.

**Update workflow (v1):**
- Open Supabase dashboard → weekly_forecast table → insert/update row
- No admin panel needed
- Consider creating a simple SQL template or Supabase function to make this quick

**Design notes:**
- Use color coding: red for "prices going up, fill now", green for "prices going down, wait", neutral for "stable"
- Should be dismissible but reappear on next app open
- The banner should feel urgent without being alarming — helpful, not stressful

### 6.2 Nearest Stations List

**Location:** Main tab / home screen, below the forecast banner.

**What it shows:**
- List of fuel stations sorted by distance from user's current location
- Each card shows: station name, brand logo, distance (km), address
- Price for user's selected fuel type prominently displayed
- Visual indicator for cheapest option in the visible list (e.g., green badge "Mais barato")
- Option to sort by: distance (default) or price (cheapest first)
- Filter by fuel type (selector at top: Gasóleo simples | Gasóleo aditivado | Gasolina 95 | Gasolina 98 | GPL Auto)
- Filter by brand (optional — Galp, BP, Repsol, Prio, etc.)

**Brand logos:**
- Use actual fuel brand logos for visual recognition in station cards and map markers
- Required logos for v1: Galp, BP, Repsol, Prio, Intermarché, E.Leclerc, Cepsa, Alves Bandeira, Auchan, Jumbo, and a generic "independent station" fallback icon
- Source high-quality logos (SVG preferred) and bundle them in the app

**Behavior:**
- On first open, request location permission (with clear Portuguese explanation of why)
- If location denied, show search by district/municipality
- Tapping a station opens the Station Detail screen
- Pull-to-refresh updates prices
- Default radius: show stations within 10km, expandable

**Performance:**
- Use the `current_prices` materialized view for fast queries
- Geospatial query using PostGIS extension in Supabase (or calculate distance client-side for v1 simplicity)
- Paginate results (load 20 at a time)

### 6.3 Map View

**Location:** Second tab or toggle from list view.

**What it shows:**
- Full map of Portugal with station markers
- Markers color-coded by price (green = cheap, yellow = mid, red = expensive) relative to the average in the visible area
- Marker shows brand logo or generic fuel pump icon
- Tapping a marker shows a popup/bottom sheet with: station name, brand, price for selected fuel type, distance, "Ver detalhes" button
- User's current location shown as blue dot
- Cluster markers when zoomed out (too many individual pins is unusable)

**Interactions:**
- Pinch to zoom, pan to explore
- Fuel type selector overlaid on map (same as list view)
- "Centrar em mim" button to re-center on user location
- Search bar to jump to a city/address

**Technical:**
- react-native-maps with marker clustering (react-native-map-clustering library)
- Load stations in visible viewport only (bounding box query)
- Debounce map movement to avoid excessive API calls

### 6.4 Station Detail Screen

**Accessed by:** Tapping a station in the list or map.

**What it shows:**

**Header section:**
- Station name and brand (with logo)
- Address
- Distance from user
- Opening hours
- Available services (icons for: loja, lavagem, ar/água, etc.)
- "Como chegar" button → opens native Maps app with directions

**Prices section:**
- All available fuel types with current prices
- Last updated timestamp for each price
- Comparison to district/national average (e.g., "2 cênt abaixo da média")

**Price History Chart (inspired by FuelUp):**
- Line chart showing price evolution over time
- Time range selector: 7D | 30D | 90D | 1A
- Show data points on the line (tappable for exact value + date)
- Display below the chart: period low, period high, period average
- One chart per fuel type (tabs or segmented control to switch)

**Insights section (simple, rule-based):**
- "Este posto é consistentemente X cênt mais barato que a média do distrito"
- "Preço médio mais baixo: terça-feira" (day-of-week analysis from price history)
- These are basic statistical calculations over the cached price history, not machine learning
- Only show insights when enough historical data exists (minimum 30 days)

### 6.5 Tank Calculator / Savings Calculator

**Accessed by:** Dedicated tab or section within Station Detail.

**Setup (one-time, stored locally):**
- Tank size slider (20L to 200L, for cars, vans, trucks)
- Default fuel type preference

**What it shows:**
- Given your tank size and selected fuel type:
  - Compare any two stations side by side
  - "Station A: €1.559/L → Depósito cheio: €77.95"
  - "Station B: €1.629/L → Depósito cheio: €81.45"
  - "Poupa €3.50 por depósito na Station A"
  - Projected savings: weekly, monthly, yearly (based on user input of fill-ups per week/month)
- Connected to the weekly forecast: "Se atestar hoje em vez de segunda, poupa €X neste depósito"

**Design:**
- Clean, visual, satisfying — seeing the yearly savings number in big green text is the dopamine hit that makes people share the app
- The comparison should auto-populate with the cheapest and second-cheapest nearby stations, but be manually changeable

### 6.6 User Preferences / Settings

**Stored locally (AsyncStorage) — no account needed for v1:**
- Preferred fuel type (default filter for list/map)
- Tank size (for calculator)
- Fill-up frequency (for savings projections)
- Favorite stations (starred, appear at top of list)
- App language: Portuguese (default). English as secondary option.

---

## 7. Navigation Structure

```
Tab Bar (bottom):
├── Início (Home)
│   ├── Weekly Forecast Banner
│   ├── Fuel Type Selector
│   ├── Sort toggle (distance / price)
│   └── Nearest Stations List
│       └── → Station Detail Screen
│           ├── Info + Prices
│           ├── Price History Chart
│           └── Insights
├── Mapa (Map)
│   ├── Full map with markers
│   ├── Fuel Type Selector overlay
│   └── Station popup → Station Detail
├── Calculadora (Calculator)
│   ├── Tank Size setting
│   ├── Station Comparison
│   └── Savings Projections
└── Definições (Settings)
    ├── Preferred fuel type
    ├── Tank size
    ├── Fill-up frequency
    ├── Favorite stations
    └── About / Feedback
```

---

## 8. Design Direction

### For v1: Clean and functional

- **Theme:** Keep it basic and clean for now. A detailed design document is being prepared separately and will override these defaults.
- **Typography:** System fonts (San Francisco on iOS, Roboto on Android) for native feel and performance
- **Color palette (placeholder):**
  - Primary: A bold, energetic accent color (to be defined in design doc)
  - Background: Light theme as default
  - Price indicators: Green (cheap/savings), Red (expensive/price increase), Yellow/Orange (moderate)
  - Brand colors: Use actual fuel brand logos for station identification
- **Iconography:** Use a consistent icon set (e.g., Phosphor Icons or SF Symbols where available)
- **Motion:** Subtle, purposeful animations — smooth list scrolling, chart drawing animation, satisfying calculator updates. Nothing flashy, everything functional.

### Key design principles

1. **Glanceable:** The forecast banner and price comparisons should be understood in under 2 seconds
2. **Portuguese first:** All UI text in Portuguese by default. Use familiar terms (gasóleo not diesel, atestar not encher)
3. **Trust through transparency:** Always show when prices were last updated. Never show stale data without flagging it.
4. **One-handed use:** All primary actions reachable with thumb. Tab bar at bottom, key actions in lower half of screen.

---

## 9. Development Phases

### Phase 1: Foundation (Week 1–2)

- [ ] Initialize Expo project with TypeScript
- [ ] Set up Supabase project (database, tables, API)
- [ ] Register for API Aberta API key at app.apiaberta.pt
- [ ] Build sync script: fetch from API Aberta → upsert into Supabase
- [ ] Run first data import and verify station/price data
- [ ] Implement basic navigation structure (4 tabs)
- [ ] Build station list with real data
- [ ] Implement location services and distance calculation

### Phase 2: Core Features (Week 3–4)

- [ ] Build map view with station markers and clustering
- [ ] Build station detail screen with price display and brand logos
- [ ] Implement fuel type filtering across list and map
- [ ] Build price history chart component
- [ ] Implement weekly forecast banner (reading from Supabase)
- [ ] Sort by distance / sort by price

### Phase 3: Calculator & Polish (Week 5–6)

- [ ] Build tank calculator / savings comparison screen
- [ ] Implement local storage for user preferences
- [ ] Add favorite stations functionality
- [ ] Build settings screen
- [ ] Station insights (basic statistical analysis of price history)
- [ ] Loading states, empty states, error handling
- [ ] Pull-to-refresh, pagination

### Phase 4: Launch Prep (Week 7–8)

- [ ] Design polish pass (once design document is ready)
- [ ] Performance optimization (list virtualization, image caching, query optimization)
- [ ] Test on physical iOS and Android devices
- [ ] Create app store assets (screenshots, description, icon)
- [ ] Set up privacy policy page
- [ ] Submit to App Store and Google Play
- [ ] Set up GitHub Actions cron for daily data sync
- [ ] Populate first weekly forecast

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| API Aberta goes down or changes | No fresh price data | Supabase cache provides fallback; the connector-fuel repo is open source so we can self-host if needed |
| API Aberta rate limits hit | Degraded sync | We only need ~5 requests per sync (one per fuel type), well within free tier. Cache locally so the app never calls API Aberta directly |
| Price data is stale or inaccurate | User trust loss | Always display "last updated" timestamps prominently; flag stale data (>48h old) with a warning |
| Low initial downloads | Slow growth | Focus on Portuguese tech/car communities (Reddit r/portugal, forums, car Facebook groups); the weekly forecast feature is inherently shareable |
| App Store rejection | Launch delay | Follow Apple/Google guidelines strictly; ensure location permission justification is clear; have privacy policy ready |
| Brand logo usage issues | Visual identity weakened | Logos are used for informational purposes (identifying stations), which is generally acceptable; if any brand objects, swap to text labels with colored badges |

---

## 11. Open Questions

1. **API Aberta response format:** The exact JSON response structure for stations (coordinates, services, opening hours fields) needs to be confirmed by testing the live API. The connector-fuel repo and Swagger docs at api.apiaberta.pt/docs are the reference.
2. **Price history depth:** API Aberta serves current prices. Our price history only starts accumulating from the day we first sync. Consider if there's a way to backfill historical data from DGEG's statistics section for richer initial charts.
3. **Monetization (future):** Not a v1 concern, but worth thinking about. Options discussed: premium features (price alerts, advanced analytics), sponsored station listings, affiliate partnerships with fuel cards.

---

*This PRD is a living document. It will be updated as the design document is finalized and as development reveals new requirements or constraints.*
