# ⛽ Combustíveis

**Preços de combustíveis em Portugal** — Find the cheapest fuel near you.

A React Native (Expo) mobile app for iOS and Android that helps Portuguese drivers save money on fuel. Real-time prices from all stations in continental Portugal, weekly price forecasts, price history tracking, and a savings calculator.

## Features (v1)

- 📍 **Nearest stations** — sorted by distance or price, with brand logos
- 🗺️ **Map view** — all stations in Portugal with color-coded price markers
- 📈 **Price history** — track price trends over 7 days, 30 days, 90 days, or 1 year
- 🔮 **Weekly forecast** — "Should I fill up now or wait until Monday?" with savings estimate
- 🧮 **Savings calculator** — compare stations side by side, see yearly savings
- ⭐ **Favorites** — save your go-to stations

## Tech Stack

- **React Native** + **Expo** (SDK 52+)
- **TypeScript**
- **Expo Router** (file-based navigation)
- **Supabase** (PostgreSQL database + REST API)
- **API Aberta** (Portuguese public data API — fuel prices from DGEG)
- **Zustand** (state management)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

## Environment Setup

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

You'll need:
- **API Aberta key** — register free at [app.apiaberta.pt](https://app.apiaberta.pt)
- **Supabase project** — create free at [supabase.com](https://supabase.com)

## Data Source

All fuel price data comes from [API Aberta](https://apiaberta.pt), which aggregates official DGEG (Direção-Geral de Energia e Geologia) data. Portuguese law requires all fuel stations to report prices — this data covers continental Portugal.

## Coverage

🇵🇹 **Continental Portugal** — all 18 districts, from Viana do Castelo to Faro.

The Azores and Madeira have separate regulated pricing systems and are not covered in v1.

## License

TBD

---

Made with ❤️ in Lisboa
