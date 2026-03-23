import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ForecastBanner } from '@/components/ForecastBanner';
import { FuelTypeSelector } from '@/components/FuelTypeSelector';
import { StationCard } from '@/components/StationCard';
import { usePreferences } from '@/stores/usePreferences';
import { getCurrentLocation, calculateDistance } from '@/lib/location';
import { getMockStations, MOCK_FORECASTS, MOCK_NATIONAL_AVERAGES } from '@/lib/mock-data';
import type { StationWithPrice, FuelType } from '@/lib/types';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/lib/constants';

export default function HomeScreen() {
  const router = useRouter();
  const { fuelType, setFuelType, tankSize, sortBy, setSortBy, favorites, toggleFavorite } =
    usePreferences();

  const [stations, setStations] = useState<StationWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  const loadStations = useCallback(async () => {
    const location = await getCurrentLocation();
    if (location) {
      setUserLat(location.latitude);
      setUserLng(location.longitude);
    }

    // Use mock data (replace with Supabase queries when configured)
    const mockStations = getMockStations(fuelType);
    const withDistance = mockStations.map((s) => ({
      ...s,
      distance: location
        ? Math.round(
            calculateDistance(location, { latitude: s.latitude, longitude: s.longitude }) * 10,
          ) / 10
        : undefined,
    }));

    setStations(withDistance);
    setLoading(false);
  }, [fuelType]);

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStations();
    setRefreshing(false);
  }, [loadStations]);

  const sortedStations = useMemo(() => {
    const sorted = [...stations];
    if (sortBy === 'price') {
      sorted.sort((a, b) => a.price - b.price);
    } else {
      sorted.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
    }
    return sorted;
  }, [stations, sortBy]);

  const cheapestId = useMemo(() => {
    if (stations.length === 0) return null;
    return stations.reduce((min, s) => (s.price < min.price ? s : min), stations[0]).id;
  }, [stations]);

  const forecasts = MOCK_FORECASTS.filter(
    (f) => f.fuel_type === fuelType || f.fuel_type === 'diesel' || f.fuel_type === 'gasoline_95',
  ).slice(0, 2);

  const nationalAvg = MOCK_NATIONAL_AVERAGES[fuelType];

  const renderHeader = () => (
    <View>
      {/* Forecast banners */}
      <View style={styles.forecastSection}>
        {forecasts.map((forecast) => (
          <ForecastBanner key={forecast.id} forecast={forecast} tankSize={tankSize} />
        ))}
      </View>

      {/* Fuel type selector */}
      <View style={styles.selectorSection}>
        <FuelTypeSelector selected={fuelType} onSelect={setFuelType} compact />
      </View>

      {/* Sort toggle + results count */}
      <View style={styles.sortRow}>
        <Text style={styles.resultsCount}>
          {stations.length} postos encontrados
        </Text>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'distance' && styles.sortButtonActive]}
            onPress={() => setSortBy('distance')}
          >
            <Text style={[styles.sortText, sortBy === 'distance' && styles.sortTextActive]}>
              Distância
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'price' && styles.sortButtonActive]}
            onPress={() => setSortBy('price')}
          >
            <Text style={[styles.sortText, sortBy === 'price' && styles.sortTextActive]}>
              Preço
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>A carregar postos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedStations}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={<View style={{ height: 20 }} />}
        renderItem={({ item }) => (
          <StationCard
            station={item}
            isCheapest={item.id === cheapestId}
            isFavorite={favorites.includes(item.id)}
            onPress={() => router.push(`/station/${item.id}`)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            nationalAverage={nationalAvg}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Continental Portugal disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>Dados referentes a Portugal Continental</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  forecastSection: {
    gap: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  selectorSection: {
    paddingBottom: Spacing.lg,
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  resultsCount: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  sortButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.surface,
  },
  sortButtonActive: {
    backgroundColor: Colors.primary,
  },
  sortText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  sortTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.semibold,
  },
  disclaimer: {
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  disclaimerText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
